# Phase 6: Follow-up Reminders - Research

**Researched:** 2026-04-06
**Domain:** Supabase pg_cron + Edge Functions + Web Push notifications
**Confidence:** HIGH

## Summary

This phase adds automated reminder notifications for tasks that sit in Open status too long. The architecture is straightforward: a Supabase pg_cron job fires every 15 minutes, calls a new `remind-tasks` Edge Function via pg_net HTTP, and that function queries for stale tasks, sends push notifications to all subscribers, and updates a `last_reminder_at` timestamp to prevent duplicate sends.

The existing `notify-task` Edge Function provides an almost-complete template. The new function reuses the same VAPID configuration, subscription fan-out pattern, and expired-subscription cleanup logic. The main new work is: (1) a SQL migration adding `last_reminder_at` to tasks, (2) a new Edge Function with the stale-task query and elapsed-time formatting, and (3) a SQL migration setting up pg_cron + pg_net + Vault secrets to schedule the function.

**Primary recommendation:** Clone the `notify-task` Edge Function pattern, modify the query to find stale Open tasks, format the "Overdue Task" payload per CONTEXT.md decisions, and wire it up with pg_cron via a single SQL migration.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** First reminder fires after a task has been in Open status for 2 hours.
- **D-02:** Reminders repeat every 2 hours while the task remains in Open status (e.g., a task open for 6 hours would have been nudged 3 times).
- **D-03:** Reminders stop immediately when a task moves to In Progress or Done (REM-03).
- **D-04:** Reminder notification title: "Overdue Task". Body: "{client_name} has been waiting {elapsed_time}". Urgent tone, not a friendly nudge.
- **D-05:** Elapsed time formatted in human-friendly style: "2 hours", "45 minutes", "1 day". Not compact ("2h") or precise timestamps.
- **D-06:** Use Supabase pg_cron extension to schedule a recurring job every 15 minutes. The cron job calls a new Edge Function that queries for stale Open tasks and sends push notifications.
- **D-07:** Add a `last_reminder_at` timestamp column to the tasks table. Only send a reminder if the time since `last_reminder_at` (or `created_at` if null) exceeds the threshold. Update `last_reminder_at` after sending. This prevents duplicate sends when the cron runs multiple times before a task status changes.
- **D-08:** The reminder Edge Function is separate from the existing `notify-task` function (which handles new-task notifications on INSERT). Different trigger, different payload format.
- **D-09:** Reminder threshold configured via environment variable `REMINDER_THRESHOLD_HOURS=2`. No in-app settings UI.
- **D-10:** No per-staff mute/snooze capability. Everyone gets all reminders.

### Claude's Discretion
- Exact pg_cron SQL syntax and schedule expression
- Edge Function structure (reuse patterns from notify-task or build fresh)
- Whether to add an index on `status` + `created_at` for the stale task query
- Migration strategy for adding `last_reminder_at` column
- Error handling when push delivery fails for a reminder

### Deferred Ideas (OUT OF SCOPE)
None.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REM-01 | Staff receive a push notification when any task stays in Open status for longer than a configurable threshold | pg_cron scheduling pattern, stale task query, Edge Function with REMINDER_THRESHOLD_HOURS env var |
| REM-02 | Reminder notification includes client name and how long the task has been open | Elapsed time formatting logic in Edge Function, "Overdue Task" title + "{client_name} has been waiting {elapsed_time}" body |
| REM-03 | Reminders stop once a task moves out of Open status | Query filters on `status = 'open'`, no further action needed -- tasks not in Open are simply not selected |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Framework:** TanStack Start (React + Vite) with Nitro server, Supabase backend
- **Edge Functions:** Deno runtime with `npm:` imports, located in `supabase/functions/`
- **Migrations:** SQL files in `supabase/migrations/`, sequential numbering (0001, 0002, 0003 exist)
- **Tests:** Vitest with jsdom, files in `tests/` mirroring app structure, setup at `tests/setup.ts`
- **Env vars:** Server-side uses `process.env`, Edge Functions use `Deno.env.get()`
- **Database types:** Generated in `app/lib/database.types.ts` -- must be regenerated after migration
- **Constants:** Task statuses in `app/lib/constants.ts`

## Architecture Patterns

### Recommended Project Structure (new files only)

```
supabase/
  functions/
    remind-tasks/
      index.ts          # New Edge Function
  migrations/
    0004_reminder_column.sql    # Adds last_reminder_at + pg_cron setup
```

### Pattern 1: pg_cron + pg_net to invoke Edge Function

**What:** Use pg_cron to schedule a recurring SQL statement that calls `net.http_post()` to invoke the Edge Function over HTTP. Store the Supabase URL and service role key in Vault for secure access.

**When to use:** Any time you need periodic server-side jobs in Supabase without external schedulers.

**SQL Migration (all in one migration file):**

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Add last_reminder_at to tasks (D-07)
ALTER TABLE public.tasks
  ADD COLUMN last_reminder_at timestamptz;

-- Store secrets in Vault for secure pg_cron access
-- NOTE: These must be run in the Supabase SQL Editor for hosted projects,
-- or the values set via Dashboard > Vault. The migration file documents
-- the intent; actual secret values are deployment-specific.
-- select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
-- select vault.create_secret('<service-role-key>', 'service_role_key');

-- Schedule reminder check every 15 minutes
SELECT cron.schedule(
  'remind-stale-tasks',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
           || '/functions/v1/remind-tasks',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

**Key detail:** The cron job uses the **service role key** (not anon key) because the Edge Function needs to bypass RLS to read all subscriptions and update `last_reminder_at`. The `notify-task` function already uses `SUPABASE_SERVICE_ROLE_KEY` for its Supabase client.

### Pattern 2: Stale Task Query with Reminder Deduplication

**What:** Query for tasks that are Open and overdue, using `last_reminder_at` (falling back to `created_at`) to determine eligibility.

```sql
SELECT id, client_name, created_at, last_reminder_at
FROM tasks
WHERE status = 'open'
  AND (
    COALESCE(last_reminder_at, created_at) + interval '1 hour' * $threshold
  ) <= now();
```

**Why COALESCE:** For tasks that have never been reminded, `last_reminder_at` is NULL, so we fall back to `created_at`. After the first reminder, we compare against `last_reminder_at` for the 2-hour repeat interval.

### Pattern 3: Elapsed Time Formatting (Deno/TypeScript)

**What:** Format the duration since `created_at` in human-friendly style per D-05.

```typescript
function formatElapsed(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return days === 1 ? '1 day' : `${days} days`
  if (hours > 0) return hours === 1 ? '1 hour' : `${hours} hours`
  return minutes === 1 ? '1 minute' : `${minutes} minutes`
}
```

Note: Elapsed time is calculated from `created_at` (total wait time), not from `last_reminder_at` (time since last nudge).

### Pattern 4: Reuse notify-task Push Dispatch

The `remind-tasks` Edge Function should mirror `notify-task/index.ts` exactly for:
- VAPID setup via `Deno.env.get()`
- Supabase client creation with service role key
- Subscription fetch from `push_subscriptions`
- `Promise.allSettled` fan-out
- 410 Gone expired subscription cleanup

The only differences from `notify-task`:
1. **Trigger:** HTTP POST from pg_cron (not a database webhook payload)
2. **Query:** Fetches stale Open tasks instead of receiving a single INSERT record
3. **Payload:** "Overdue Task" title with elapsed time instead of "New Task" with request type
4. **Side effect:** Updates `last_reminder_at` on tasks after sending

### Anti-Patterns to Avoid
- **Polling from the client:** Do not implement reminders as client-side timers. The cron job runs server-side regardless of whether any client is connected.
- **Combining with notify-task:** Keep the functions separate per D-08. Different triggers, different payloads, different query logic.
- **Using anon key for cron invocation:** The anon key subject to RLS. Use service role key since the function needs unrestricted access.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Recurring job scheduling | Custom setInterval or external cron service | Supabase pg_cron + pg_net | Runs in-database, zero infrastructure, automatic retry |
| Push notification dispatch | Raw fetch to push endpoints | `npm:web-push` (already used) | Handles VAPID signing, encryption, payload formatting |
| Secret storage for cron | Hardcoded keys in SQL | Supabase Vault | Encrypted at rest, accessible from pg_cron SQL |
| Elapsed time formatting | Date math from scratch | Simple function (above) | Only 10 lines, no library needed for this simple case |

## Common Pitfalls

### Pitfall 1: Vault Secrets Not Set
**What goes wrong:** The pg_cron job runs but `vault.decrypted_secrets` returns NULL, causing the HTTP request to fail silently.
**Why it happens:** Vault secrets must be created manually in the Supabase Dashboard or SQL Editor -- they cannot be set via migration files because the actual values are deployment-specific.
**How to avoid:** Document the required Vault secrets as a deployment step. The migration should include commented-out `vault.create_secret` calls as documentation.
**Warning signs:** Check `cron.job_run_details` for failed runs. The `pg_net` response will show connection errors.

### Pitfall 2: pg_cron Extension Not Enabled
**What goes wrong:** `CREATE EXTENSION pg_cron` fails or the `cron.schedule` function is not found.
**Why it happens:** On Supabase hosted, pg_cron is available but may need explicit enabling. The extension must be in `pg_catalog` schema.
**How to avoid:** Use `CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;` in the migration.
**Warning signs:** SQL error on migration apply.

### Pitfall 3: Duplicate Reminders on Concurrent Cron Runs
**What goes wrong:** If the Edge Function takes longer than expected, the next cron tick might fire before the previous one finishes, sending duplicate reminders.
**Why it happens:** pg_cron does not prevent overlapping runs by default.
**How to avoid:** The `last_reminder_at` column is the primary defense -- the function updates it atomically before/after sending. Even if runs overlap, the second run's query will not match tasks already reminded. Use an UPDATE...RETURNING pattern to atomically claim tasks.
**Warning signs:** Users report receiving the same reminder twice in quick succession.

### Pitfall 4: Edge Function Auth When Called by pg_cron
**What goes wrong:** The Edge Function returns 401 because it expects a user JWT but receives a service role key.
**Why it happens:** The `notify-task` function is triggered by a database webhook (which passes a service role key automatically). The `remind-tasks` function is called via HTTP with an explicit Authorization header.
**How to avoid:** The service role key in the Authorization header is sufficient. The Edge Function should NOT call `supabase.auth.getUser()` for authentication -- it should verify the request has a valid service role key or skip auth entirely (the function is not publicly discoverable and only called by pg_cron).
**Warning signs:** 401 responses in `cron.job_run_details`.

### Pitfall 5: Timezone Issues in Elapsed Time
**What goes wrong:** Elapsed time calculation is wrong because `created_at` is compared to server time in a different timezone.
**Why it happens:** PostgreSQL stores `timestamptz` in UTC. `Date.now()` in Deno is also UTC. This should be fine as long as both sides use UTC consistently.
**How to avoid:** Always use `timestamptz` (already the case). Do not convert to local time for the comparison -- only format the elapsed duration.
**Warning signs:** Reminders fire too early or too late by timezone offset hours.

## Code Examples

### Complete remind-tasks Edge Function Structure

```typescript
// supabase/functions/remind-tasks/index.ts
import webpush from 'npm:web-push'
import { createClient } from 'npm:@supabase/supabase-js@2'

// VAPID setup (same as notify-task)
webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
)

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

function formatElapsed(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return days === 1 ? '1 day' : `${days} days`
  if (hours > 0) return hours === 1 ? '1 hour' : `${hours} hours`
  return minutes === 1 ? '1 minute' : `${minutes} minutes`
}

Deno.serve(async (_req) => {
  try {
    const thresholdHours = Number(Deno.env.get('REMINDER_THRESHOLD_HOURS') ?? '2')

    // Find stale Open tasks eligible for reminder (D-01, D-02, D-07)
    const { data: staleTasks, error: taskError } = await supabase
      .from('tasks')
      .select('id, client_name, created_at, last_reminder_at')
      .eq('status', 'open')
      .lte(
        // Tasks where COALESCE(last_reminder_at, created_at) + threshold <= now()
        // Supabase JS doesn't support COALESCE in .lte(), so use RPC or raw filter
      )

    // Alternative: use a database function or .rpc() for the stale task query
    // See "Stale Task Query" section below

    if (taskError || !staleTasks?.length) {
      return new Response(JSON.stringify({ reminded: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Fetch all push subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')

    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ reminded: 0, reason: 'no_subscribers' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let totalSent = 0

    for (const task of staleTasks) {
      const elapsed = formatElapsed(task.created_at)
      const notification = JSON.stringify({
        title: 'Overdue Task',
        body: `${task.client_name} has been waiting ${elapsed}`,
      })

      // Fan out to all subscribers
      const results = await Promise.allSettled(
        subscriptions.map((sub) =>
          webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            notification,
          ),
        ),
      )

      // Clean up expired subscriptions (410 Gone)
      const expired = results
        .map((r, i) =>
          r.status === 'rejected' && r.reason?.statusCode === 410 ? subscriptions[i] : null,
        )
        .filter(Boolean)

      if (expired.length > 0) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .in('endpoint', expired.map((e) => e!.endpoint))
      }

      // Update last_reminder_at (D-07)
      await supabase
        .from('tasks')
        .update({ last_reminder_at: new Date().toISOString() })
        .eq('id', task.id)

      totalSent++
    }

    return new Response(JSON.stringify({ reminded: totalSent }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('remind-tasks error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
```

### Stale Task Query Strategy

The Supabase JS client does not natively support `COALESCE` in filter methods. Two approaches:

**Option A: Database function (recommended)**
Create a Postgres function in the migration that returns stale tasks, then call via `.rpc()`:

```sql
CREATE OR REPLACE FUNCTION get_stale_open_tasks(threshold_hours int)
RETURNS SETOF tasks
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM tasks
  WHERE status = 'open'
    AND COALESCE(last_reminder_at, created_at) + (threshold_hours || ' hours')::interval <= now();
$$;
```

Then in the Edge Function: `supabase.rpc('get_stale_open_tasks', { threshold_hours: thresholdHours })`

**Option B: Raw filter**
Use `.or()` with two conditions to avoid COALESCE:

```typescript
// Tasks where last_reminder_at is NULL and created_at is old enough
// OR last_reminder_at is not NULL and last_reminder_at is old enough
const cutoff = new Date(Date.now() - thresholdHours * 3600_000).toISOString()
const { data } = await supabase
  .from('tasks')
  .select('id, client_name, created_at, last_reminder_at')
  .eq('status', 'open')
  .or(`last_reminder_at.is.null,last_reminder_at.lte.${cutoff}`)
  .or(`created_at.lte.${cutoff}`)
  // This needs careful construction -- Option A is cleaner
```

**Recommendation:** Use Option A (database function). It keeps the query logic in SQL where it belongs, is testable independently, and avoids complex client-side filter composition.

### Index Recommendation

```sql
-- Optional: speeds up the stale task query on larger datasets
-- For a 3-5 person salon this is not critical, but costs nothing to add
CREATE INDEX idx_tasks_open_reminder
  ON tasks (status, last_reminder_at, created_at)
  WHERE status = 'open';
```

A partial index filtered on `status = 'open'` is ideal since the query always filters on that condition. For a small dataset (likely < 100 open tasks at any time), the index is a micro-optimization but good practice.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| External cron services (AWS Lambda, Vercel Cron) | Supabase pg_cron + pg_net (in-database) | Available since 2023, improved 2024-2025 | Zero external infrastructure needed |
| Hardcoded secrets in cron SQL | Supabase Vault for encrypted secret storage | 2024 | Secrets encrypted at rest, accessed via `vault.decrypted_secrets` |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x |
| Config file | Inline in package.json (`"test": "vitest run"`) |
| Quick run command | `npx vitest run tests/server/` |
| Full suite command | `npm run test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REM-01 | Stale Open tasks trigger reminder dispatch | unit | `npx vitest run tests/server/reminders.test.ts -t "sends reminders"` | No -- Wave 0 |
| REM-02 | Notification includes client name and elapsed time | unit | `npx vitest run tests/server/reminders.test.ts -t "notification content"` | No -- Wave 0 |
| REM-03 | Non-open tasks excluded from reminders | unit | `npx vitest run tests/server/reminders.test.ts -t "skips non-open"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/server/reminders.test.ts`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/server/reminders.test.ts` -- unit tests for elapsed time formatting and stale task query logic
- [ ] The Edge Function itself runs in Deno and cannot be directly tested by Vitest. Unit tests should extract and test the pure logic (formatElapsed, query construction) while the integration is verified by deployment + manual check of `cron.job_run_details`.

### Testing Constraints
The Edge Function runs in Supabase's Deno runtime, not in the Node/Vitest environment. Testing strategy:
1. **Unit-testable logic** (formatElapsed, notification payload construction): Extract into a shared module, test with Vitest
2. **SQL migration correctness:** Verified by applying migration to Supabase (manual/CI)
3. **End-to-end flow:** Verified by checking `cron.job_run_details` after deployment and confirming push notifications arrive

## Open Questions

1. **Vault Secret Setup Timing**
   - What we know: Vault secrets must be created before the cron job can successfully invoke the Edge Function
   - What's unclear: Whether the migration can safely include `vault.create_secret` with placeholder values, or if this must be a manual step
   - Recommendation: Document as a manual deployment step. Include commented SQL in migration for reference.

2. **pg_cron Already Enabled?**
   - What we know: Supabase hosted projects have pg_cron available
   - What's unclear: Whether it is already enabled on this project or needs `CREATE EXTENSION`
   - Recommendation: Use `CREATE EXTENSION IF NOT EXISTS` which is safe either way

3. **Service Worker Handling of Reminder vs New Task Notifications**
   - What we know: The current service worker in `app/sw.ts` handles push events generically -- it reads `title` and `body` from the payload and displays them. This works for both "New Task" and "Overdue Task" notifications without any changes.
   - Recommendation: No service worker changes needed. The existing handler is payload-agnostic.

## Sources

### Primary (HIGH confidence)
- Supabase scheduling docs: https://supabase.com/docs/guides/functions/schedule-functions -- pg_cron + pg_net + Vault pattern
- Supabase cron docs: https://supabase.com/docs/guides/cron -- extension setup and job management
- Existing codebase: `supabase/functions/notify-task/index.ts` -- verified push dispatch pattern
- Existing codebase: `supabase/migrations/0001_initial.sql` -- tasks table schema

### Secondary (MEDIUM confidence)
- Supabase Vault for secret storage in pg_cron context (verified via official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- reuses existing libraries (web-push, supabase-js) already proven in notify-task
- Architecture: HIGH -- pg_cron + pg_net is the documented Supabase pattern for scheduled Edge Function invocation
- Pitfalls: HIGH -- drawn from official docs and real codebase patterns

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable infrastructure, low churn)

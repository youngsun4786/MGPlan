# Phase 6: Follow-up Reminders - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Automated push notification reminders when tasks sit in Open status too long. A Supabase pg_cron job checks every 15 minutes for stale tasks and fires push notifications to all subscribed staff. After this phase, no task silently goes stale — staff get nudged until the task moves out of Open.

</domain>

<decisions>
## Implementation Decisions

### Reminder Timing (REM-01)
- **D-01:** First reminder fires after a task has been in Open status for 2 hours.
- **D-02:** Reminders repeat every 2 hours while the task remains in Open status (e.g., a task open for 6 hours would have been nudged 3 times).
- **D-03:** Reminders stop immediately when a task moves to In Progress or Done (REM-03).

### Notification Content (REM-02)
- **D-04:** Reminder notification title: "Overdue Task". Body: "{client_name} has been waiting {elapsed_time}". Urgent tone, not a friendly nudge.
- **D-05:** Elapsed time formatted in human-friendly style: "2 hours", "45 minutes", "1 day". Not compact ("2h") or precise timestamps.

### Scheduling Mechanism
- **D-06:** Use Supabase pg_cron extension to schedule a recurring job every 15 minutes. The cron job calls a new Edge Function that queries for stale Open tasks and sends push notifications.
- **D-07:** Add a `last_reminder_at` timestamp column to the tasks table. Only send a reminder if the time since `last_reminder_at` (or `created_at` if null) exceeds the threshold. Update `last_reminder_at` after sending. This prevents duplicate sends when the cron runs multiple times before a task status changes.
- **D-08:** The reminder Edge Function is separate from the existing `notify-task` function (which handles new-task notifications on INSERT). Different trigger, different payload format.

### Configuration
- **D-09:** Reminder threshold configured via environment variable `REMINDER_THRESHOLD_HOURS=2`. No in-app settings UI. Changed by whoever manages the Vercel/Supabase deployment.
- **D-10:** No per-staff mute/snooze capability. Everyone gets all reminders. Staff can mute at the OS notification level if needed. The whole point is that no task goes unnoticed.

### Claude's Discretion
- Exact pg_cron SQL syntax and schedule expression
- Edge Function structure (reuse patterns from notify-task or build fresh)
- Whether to add an index on `status` + `created_at` for the stale task query
- Migration strategy for adding `last_reminder_at` column
- Error handling when push delivery fails for a reminder

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Push Infrastructure
- `supabase/functions/notify-task/index.ts` — Existing new-task notification Edge Function (pattern reference for web-push dispatch, VAPID config, subscription fan-out, expired subscription cleanup)
- `app/server/push.ts` — Server function for saving/deleting push subscriptions (Zod schema, Supabase client pattern)
- `app/hooks/usePushSubscription.ts` — Client-side push subscription management hook

### Database
- `app/lib/database.types.ts` — Supabase generated types (tasks table, push_subscriptions table)
- `supabase/migrations/` — Existing migrations directory (new migration needed for `last_reminder_at` column)

### Domain Constants
- `app/lib/constants.ts` — Task statuses (Open, In Progress, Done) and request types

### Configuration
- `app/lib/supabase.server.ts` — Server-side Supabase client (uses `process.env`)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `notify-task/index.ts`: Web Push dispatch pattern — VAPID setup, subscription fetch, `Promise.allSettled` fan-out, expired subscription cleanup. The reminder function can reuse this exact pattern with different payload.
- `push_subscriptions` table: Already stores endpoint, p256dh, auth for all subscribed staff.
- `app/lib/constants.ts`: `TASK_STATUS` constants — use for the stale task query filter.

### Established Patterns
- Edge Functions use Deno runtime with `npm:` imports for `web-push` and `@supabase/supabase-js`
- Server functions use `createServerFn` with Zod validation and Supabase auth
- All table operations go through typed Supabase client

### Integration Points
- New Edge Function `remind-tasks` invoked by pg_cron (not a webhook — different trigger)
- `last_reminder_at` column added to `tasks` table via migration
- `REMINDER_THRESHOLD_HOURS` env var read by the Edge Function
- Reuses same `push_subscriptions` table and VAPID keys as `notify-task`

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard cron + push notification approach applies.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-follow-up-reminders*
*Context gathered: 2026-04-06*

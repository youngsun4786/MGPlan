# Phase 6: Follow-up Reminders - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-06
**Phase:** 06-follow-up-reminders
**Areas discussed:** Reminder timing, Notification content, Scheduling mechanism, Configuration UI

---

## Reminder Timing

| Option | Description | Selected |
|--------|-------------|----------|
| 2 hours (Recommended) | Reasonable for a salon — calls should be returned same-day | ✓ |
| 1 hour | More aggressive — may feel noisy during busy periods | |
| 4 hours | More relaxed — risk afternoon calls not followed up | |

**User's choice:** 2 hours
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Repeat every 2 hours | Same interval as first reminder | ✓ |
| Single reminder only | One nudge, then silence | |
| Escalating intervals | First at 2h, then 4h, then 8h | |

**User's choice:** Repeat every 2 hours
**Notes:** None

---

## Notification Content

| Option | Description | Selected |
|--------|-------------|----------|
| Friendly nudge | Title: "Task Reminder" / Body: "{name} — open for {elapsed}" | |
| Urgent tone | Title: "Overdue Task" / Body: "{name} has been waiting {elapsed}" | ✓ |
| Minimal | Title: "Reminder" / Body: "{name} — {elapsed}" | |

**User's choice:** Urgent tone
**Notes:** User reviewed preview and chose the more pressured wording

| Option | Description | Selected |
|--------|-------------|----------|
| Human-friendly (Recommended) | "2 hours", "45 minutes", "1 day" | ✓ |
| Compact | "2h", "45m", "1d" | |
| You decide | Claude picks | |

**User's choice:** Human-friendly
**Notes:** None

---

## Scheduling Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase pg_cron (Recommended) | Postgres extension, runs SQL on schedule, calls Edge Function | ✓ |
| Vercel Cron Jobs | Vercel cron via vercel.json, hits API route | |
| You decide | Claude picks best fit | |

**User's choice:** Supabase pg_cron
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Every 15 minutes (Recommended) | Task at 2h might wait up to 2h15m | ✓ |
| Every 5 minutes | More precise, 3x invocations | |
| Every 30 minutes | Least overhead, up to 2h30m wait | |

**User's choice:** Every 15 minutes
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Track last reminder time (Recommended) | Add last_reminder_at column to tasks | ✓ |
| Separate reminders table | Logging table, more auditable | |
| You decide | Claude picks simplest approach | |

**User's choice:** Track last reminder time
**Notes:** None

---

## Configuration UI

| Option | Description | Selected |
|--------|-------------|----------|
| Environment variable (Recommended) | REMINDER_THRESHOLD_HOURS=2 in Vercel env vars | ✓ |
| Settings page in-app | Admin page for threshold | |
| Database config row | Settings table with key-value pairs | |

**User's choice:** Environment variable
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| No muting (Recommended) | Everyone gets all reminders | ✓ |
| Per-staff mute toggle | Individual staff can opt out | |

**User's choice:** No muting
**Notes:** The whole point is no task goes unnoticed

---

## Claude's Discretion

- pg_cron SQL syntax and schedule expression
- Edge Function structure (reuse from notify-task or fresh)
- Index strategy for stale task query
- Migration for last_reminder_at column
- Error handling for failed push delivery

## Deferred Ideas

None — discussion stayed within phase scope.

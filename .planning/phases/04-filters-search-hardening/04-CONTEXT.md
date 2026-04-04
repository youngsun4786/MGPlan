# Phase 04: Filters, Search & Hardening - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Production-quality polish for the task board. Add filtering by status/type/date, search by client name/phone, sort toggle, error handling, and hardening (RLS audit, cross-browser, Lighthouse).

</domain>

<decisions>
## Implementation Decisions

### Filter Bar
- **D-01:** Sticky filter bar below the header. Always visible. Contains filter chips, search input, and sort toggle in one unified row.
- **D-02:** Filters combine with AND logic — Status=Open AND Type=New Booking shows only open new bookings.
- **D-03:** Done tasks remain shown but dimmed (current behavior). No default hiding. User can explicitly filter to exclude them.
- **D-04:** Filter chips for: Status (Open, In Progress, Done), Request Type (New Booking, Change Time, Change Therapist, Other), Date range (created_at).

### Search
- **D-05:** Search input sits inside the filter bar alongside chip filters.
- **D-06:** Live filter as you type — no submit button, results narrow instantly with each keystroke. All tasks are already loaded client-side so this is fast.
- **D-07:** Search matches client name or phone number (case-insensitive substring match).

### Sort
- **D-08:** Simple toggle button in the filter bar. Tap to switch between "Oldest first" (FIFO, default per D-02 from Phase 1) and "Newest first". Arrow icon flips to indicate direction.

### Error Handling
- **D-09:** Toast notifications only for all errors. Keep last-known board state visible. No full error boundary components.
- **D-10:** Distinct "no results" empty state when filters return zero tasks: "No tasks match your filters" with a "Clear filters" button. Different from the existing "No tasks yet" empty board state.

### Hardening (Claude's Discretion)
- RLS audit approach — verify correct data access boundaries in Supabase
- Cross-browser smoke test strategy — iOS Safari, Android Chrome, macOS Chrome, Windows Chrome
- Lighthouse PWA + performance audit — target 90+ on mobile
- Environment variable audit and secrets rotation checklist

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project
- `.planning/PROJECT.md` — Project vision, constraints, tech stack decisions
- `.planning/REQUIREMENTS.md` — Phase 4 req IDs: FILT-01, FILT-02, FILT-03, FILT-04 + full QA pass
- `.planning/STATE.md` — Current progress, completed phases

### Prior Phase Context
- `.planning/phases/01-foundation-core-board/01-CONTEXT.md` — Board layout (D-01 list feed, D-02 FIFO sort), auth UX, task form design
- `.planning/phases/02-pwa-push-notifications/02-CONTEXT.md` — Push permission flow, PWA install UX
- `.planning/phases/03-ai-screenshot-processing/03-CONTEXT.md` — Screenshot attachment decisions

### Key Source Files
- `app/components/TaskBoard.tsx` — Current board with realtime subscriptions, hardcoded FIFO sort
- `app/components/TaskRow.tsx` — Row rendering with StatusBadge, screenshot thumbnail
- `app/components/Header.tsx` — Header with "+" button and UserMenu
- `app/routes/_auth/index.tsx` — Board page orchestrator
- `app/server/tasks.ts` — Server functions for CRUD operations
- `app/lib/constants.ts` — REQUEST_TYPE_LABELS, TaskStatus types

</canonical_refs>

<code_context>
## Existing Code Insights

- **TaskBoard.tsx** has a hardcoded `.sort()` by `created_at` ASC — sort toggle will modify this
- **All tasks are loaded client-side** via `fetchTasks` in the route loader — filtering and search can be pure client-side state without additional server queries
- **StatusBadge** component already renders status labels — filter chips can reuse the same color scheme
- **REQUEST_TYPE_LABELS** in constants.ts provides the label map for request type filter chips
- **Realtime subscriptions** update the local task array — filters must work with the live array, not just initial data
- **shadcn UI components** available: Button, Input, Select, Badge, Dialog — filter chips can use Badge or Button variants

</code_context>

<specifics>
## Specific Ideas

- Filter bar should feel native and fast — all filtering is client-side since the full task list is already loaded
- The bar should work well on 375px mobile screens — horizontal scrolling for chips if needed
- "Clear filters" should be a single action that resets everything (search, filters, sort) back to defaults
- The sort toggle arrow should be visually obvious about the current direction

</specifics>

<deferred>
## Deferred Ideas

None — phase scope covers the full v1 polish pass.

</deferred>

---

*Phase: 04-filters-search-hardening*
*Context gathered: 2026-04-03 via discuss-phase*

# Phase 1: Foundation & Core Board - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a working shared task board end-to-end:
- Email/password login with protected routes (Supabase Auth)
- Database schema: `tasks` and `staff` tables with RLS policies
- Manual task creation form (all fields)
- Shared task board showing all open tasks
- Status lifecycle: Open → In Progress → Done
- Edit and delete tasks
- Last-modified-by + timestamp per task
- Real-time board updates via Supabase Realtime
- Responsive Tailwind layout (mobile-first, 375px → desktop)

This phase does NOT include: push notifications, PWA install, screenshot/AI processing, or filtering/search.

</domain>

<decisions>
## Implementation Decisions

### Board Layout
- **D-01:** Display tasks as a **single scrollable list feed** (not card grid, not kanban columns).
- **D-02:** Default sort order: **oldest first (FIFO queue)** — earliest unhandled tasks surface at the top.
- **D-03:** Each list row shows: **client name, phone number, request type, and status badge** (the 4 fields staff need to act).
- **D-04:** Completed (Done) tasks **stay visible but visually dimmed** — reduced opacity or subtle strikethrough. Not hidden, not auto-archived.

### Database Schema
- **D-05:** Create a **`staff` table** mirroring `auth.users`: columns `id` (UUID, FK to `auth.users.id`), `display_name` (TEXT), `email` (TEXT). Tasks reference `staff.id` for `created_by` and `last_updated_by`. This enables friendly display names on task rows.
- **D-06:** Use **Postgres enums** for `task_status` and `request_type`:
  - `CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'done');`
  - `CREATE TYPE request_type AS ENUM ('new_booking', 'change_time', 'change_therapist', 'other');`
  - TypeScript types generated from these via Supabase CLI.
- **D-07:** Store preferred booking time as a **single `preferred_datetime TIMESTAMPTZ` column**, nullable (NULL = not specified / ASAP).
- **D-08:** RLS policy for `tasks` table: **any authenticated staff can INSERT, UPDATE, DELETE any row** — flat team model, no ownership restrictions.

### Auth UX
- **D-09:** Login page: **minimal centered card** — app name/logo, email field, password field, submit button. No full-screen backgrounds.
- **D-10:** After successful login: **redirect directly to the task board** (`/`). No intermediate welcome screen.
- **D-11:** On session expiry: **redirect to `/login` with message** "Your session expired. Please sign in again." — triggers on next auth-required action.
- **D-12:** Login error message: **generic** — "Invalid email or password" (does not confirm whether email exists).
- **D-13:** Sign out: **top-right avatar/initials icon → dropdown → Sign Out**. Not an always-visible button.

### Claude's Discretion
- Task form layout details (field ordering, modal vs inline positioning) — planner decides based on conventions
- Empty state for the board when no tasks exist — planner designs
- Loading skeleton vs spinner while fetching tasks — planner decides
- Exact Tailwind color tokens for status badges (use semantic naming from CONVENTIONS.md)
- Task edit interaction (in-place edit vs dedicated edit view) — planner decides, must be mobile-friendly

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Project vision, constraints, out-of-scope decisions
- `.planning/REQUIREMENTS.md` — Full v1 requirement list; Phase 1 req IDs: AUTH-01, AUTH-02, AUTH-03, TASK-01–08, RT-01, RT-02
- `.planning/STATE.md` — Tech stack decisions and rationale

### Roadmap
- `.planning/ROADMAP.md` — Phase 1 deliverables and requirement mapping

### Conventions & Stack
- `.planning/codebase/CONVENTIONS.md` — Naming patterns, TanStack Start patterns, Supabase patterns, Tailwind patterns, error handling, iOS Safari constraints. **MANDATORY read** — all plans must follow these.
- `.planning/codebase/STACK.md` — Tech stack decisions and rationale (TanStack Start, Supabase, Vercel, Tailwind)
- `.planning/codebase/INTEGRATIONS.md` — Integration points (Supabase Auth, Realtime, DB)
- `.planning/codebase/ARCHITECTURE.md` — File structure and architecture decisions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. No existing components, hooks, or utilities.

### Established Patterns (prescribed, not yet implemented)
- `cn()` utility (clsx + tailwind-merge) for conditional class merging — must be set up in `app/lib/utils.ts`
- TanStack Start file-based routing: routes in `app/routes/`
- Protected layout route: `app/routes/_auth.tsx` (layout wrapper that checks session)
- Supabase browser client: `app/lib/supabase.client.ts` using `createBrowserClient<Database>`
- Supabase server client: `app/lib/supabase.server.ts` using `createServerClient<Database>`
- Server functions via `createServerFn` with Zod input validation
- Realtime channel subscription: `tasks:all` — subscribe in a `useEffect` with cleanup on unmount

### Integration Points
- Supabase Auth handles session; TanStack Start route loader checks `auth.getUser()` to protect routes
- Real-time board updates: `supabase.channel('tasks:all').on('postgres_changes', ...)` subscribed in the board component
- `staff` table auto-populated on user sign-up via Supabase Auth trigger or explicit insert in the sign-up handler

</code_context>

<specifics>
## Specific Ideas

- The board is the primary screen — staff will open it 10+ times/day. Optimize for scanning speed on mobile (iOS Safari, Android Chrome).
- FIFO queue sort is intentional — this is a call-back queue, not a social feed. Oldest unresolved calls need attention first.
- Korean/English mixed content is expected in notes fields — ensure the DB and forms handle Unicode correctly (Postgres UTF-8 default covers this).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 1 scope.

</deferred>

---

*Phase: 01-foundation-core-board*
*Context gathered: 2026-04-01*

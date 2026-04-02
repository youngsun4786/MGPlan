---
phase: 01-foundation-core-board
plan: 04
subsystem: ui
tags: [react, supabase-realtime, tailwind, shadcn, vitest]

requires:
  - phase: 01-foundation-core-board/01-01
    provides: "Type definitions, constants, utility functions"
  - phase: 01-foundation-core-board/01-02
    provides: "Auth layout route with user context"
  - phase: 01-foundation-core-board/01-03
    provides: "Server functions for fetchTasks and updateTaskStatus"
provides:
  - "TaskBoard component with Supabase Realtime subscription and staffMap cache"
  - "TaskRow component with status cycling and FIFO display"
  - "StatusBadge, UserMenu, Header reusable components"
  - "Board page route at /_auth/ with server loader"
  - "Component tests for TaskBoard and TaskRow (10 passing)"
affects: [01-05-task-form, 02-pwa, ui-components]

tech-stack:
  added: []
  patterns:
    - "staffMap ref cache for enriching Realtime payloads with joined data"
    - "Optimistic UI updates with server error rollback"
    - "vi.hoisted for mock variable hoisting in vitest"

key-files:
  created:
    - app/components/StatusBadge.tsx
    - app/components/UserMenu.tsx
    - app/components/Header.tsx
    - app/components/TaskRow.tsx
    - app/components/TaskBoard.tsx
    - app/routes/_auth/index.tsx
  modified:
    - tests/components/TaskBoard.test.tsx
    - tests/components/TaskRow.test.tsx

key-decisions:
  - "Used vi.hoisted() for mock variables to solve vitest factory hoisting issue"
  - "StatusBadge renders as button when onClick provided, span otherwise"
  - "staffMap seeded from initial server data, falls back to single-row fetch for unknown staff"

patterns-established:
  - "TaskWithStaff type: Task & { staff?: { display_name: string } | null }"
  - "NEXT_STATUS record for cycling: open -> in_progress -> done -> open"
  - "Realtime enrichment pattern: staffMapRef.current.get() then fallback fetch"

requirements-completed: [TASK-03, TASK-04, TASK-07, RT-01, RT-02]

duration: 4min
completed: 2026-04-02
---

# Phase 1 Plan 4: Task Board UI Summary

**Task board with realtime Supabase subscription, status badge cycling, staffMap cache for display_name resolution, and 10 passing component tests**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-02T00:37:33Z
- **Completed:** 2026-04-02T00:41:32Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- Built complete task board UI: Header, UserMenu, StatusBadge, TaskRow, TaskBoard
- Realtime subscription on `tasks:all` channel handles INSERT/UPDATE/DELETE with staffMap cache
- Status badge cycling (open -> in_progress -> done) with optimistic updates and error rollback
- 10 component tests passing for TaskBoard (4) and TaskRow (6)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create StatusBadge, UserMenu, and Header components** - `84c5b89` (feat)
2. **Task 2: Create TaskRow component** - `1b99839` (feat)
3. **Task 3: Create TaskBoard with Realtime, board page, and tests** - `7410ebd` (feat)

## Files Created/Modified
- `app/components/StatusBadge.tsx` - Colored status pill with touch targets, accessibility labels
- `app/components/UserMenu.tsx` - Avatar dropdown with Sign Out via Supabase auth
- `app/components/Header.tsx` - Sticky top bar with app name, Create Task button, user menu
- `app/components/TaskRow.tsx` - Task row with status cycling, done dimming, updated-by info
- `app/components/TaskBoard.tsx` - Board container with realtime subscription and staffMap cache
- `app/routes/_auth/index.tsx` - Board page with server loader and layout
- `tests/components/TaskBoard.test.tsx` - 4 tests: render, empty state, realtime subscribe/unsubscribe
- `tests/components/TaskRow.test.tsx` - 6 tests: display, status change, edit, propagation

## Decisions Made
- Used `vi.hoisted()` to solve vitest mock factory hoisting -- mock variables must be defined before `vi.mock` factory runs
- StatusBadge renders as `<button>` when `onClick` provided, `<span>` otherwise for semantic HTML
- staffMap seeded from initial server-loaded data; only falls back to single-row staff fetch for unknown staff IDs (rare in 3-5 person team)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- vitest mock hoisting error: `vi.mock` factory cannot reference top-level `const` variables. Fixed by using `vi.hoisted()` to define mock functions before the factory runs.
- Pre-existing TypeScript config errors (vite/client types, noUncheckedSideEffectImports) -- not caused by this plan, no component-specific type errors.

## User Setup Required

None - no external service configuration required.

## Known Stubs
- `app/routes/_auth/index.tsx` line 21: `onCreateTask={() => {}}` -- placeholder callback, Plan 05 wires TaskForm dialog
- `app/routes/_auth/index.tsx` line 24: `onEditTask={() => {}}` -- placeholder callback, Plan 05 wires TaskForm dialog

## Next Phase Readiness
- Board UI complete, ready for Plan 05 to add TaskForm dialog and wire create/edit callbacks
- Realtime subscription active, will reflect tasks created via form immediately
- `_auth` layout route needed from Plan 02 to provide user context via `Route.useRouteContext()`

---
*Phase: 01-foundation-core-board*
*Completed: 2026-04-02*

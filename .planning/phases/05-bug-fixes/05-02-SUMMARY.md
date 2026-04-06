---
phase: 05-bug-fixes
plan: 02
subsystem: infra
tags: [typescript, mobile, photo-picker, type-safety]

# Dependency graph
requires:
  - phase: 05-01
    provides: "Root tsconfig excluding Deno/SW, separate tsconfig.sw.json, regenerated database types"
provides:
  - "Zero tsc errors across entire codebase (main + service worker)"
  - "Mobile photo picker allows library selection (not camera-only)"
  - "StatusBadge onClick type supports MouseEvent for stopPropagation"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Uint8Array<ArrayBuffer> cast for BufferSource compatibility in Web Push"
    - "TanStack Router Link search prop: always provide search object even if empty"

key-files:
  created: []
  modified:
    - app/components/TaskForm.tsx
    - app/components/TaskBoard.tsx
    - app/components/StatusBadge.tsx
    - app/lib/push.ts
    - app/routes/signup.tsx
    - app/routes/_auth/index.tsx
    - app/server/auth.ts
    - tests/components/TaskBoard.test.tsx
    - tests/components/TaskRow.test.tsx
    - tests/components/TaskForm.test.tsx
    - tests/routes/auth.test.ts

key-decisions:
  - "Used search={{ expired: undefined }} instead of search={{}} for TanStack Router Link type safety"
  - "Added created_at to staff select query rather than omitting from Staff type"
  - "Removed hasActiveFilters from TaskBoard props (unused in component, only needed by FilterBar)"

patterns-established:
  - "TanStack Router Link: always pass search prop matching route's validateSearch schema"
  - "StatusBadge onClick: typed as (e: React.MouseEvent<HTMLButtonElement>) => void to support event methods"

requirements-completed: [FIX-01, FIX-02]

# Metrics
duration: 7min
completed: 2026-04-06
---

# Phase 05 Plan 02: Localized TypeScript Fixes & Photo Picker Summary

**Zero tsc errors achieved across main and service worker configs; mobile photo picker allows library selection with "Attach Photo" label**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-06T04:25:39Z
- **Completed:** 2026-04-06T04:32:54Z
- **Tasks:** 1
- **Files modified:** 11

## Accomplishments
- `npx tsc --noEmit` and `npx tsc --noEmit -p tsconfig.sw.json` both pass with zero errors
- Mobile photo picker no longer restricted to camera-only (removed `capture="environment"` attribute)
- StatusBadge onClick type properly supports MouseEvent, preserving stopPropagation in TaskRow
- 68 of 69 tests pass (1 pre-existing failure in TaskRow unrelated to changes)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix photo picker and all localized TypeScript errors** - `b9f244c` (fix)

## Files Created/Modified
- `app/components/TaskForm.tsx` - Removed capture="environment", renamed "Attach Screenshot" to "Attach Photo"
- `app/components/TaskBoard.tsx` - Removed unused hasActiveFilters prop from interface and destructuring
- `app/components/StatusBadge.tsx` - Updated onClick type to accept MouseEvent<HTMLButtonElement>
- `app/lib/push.ts` - Added Uint8Array<ArrayBuffer> cast for BufferSource compatibility
- `app/routes/signup.tsx` - Added search={{ expired: undefined }} to both Link components
- `app/routes/_auth/index.tsx` - Removed hasActiveFilters prop from TaskBoard usage
- `app/server/auth.ts` - Added created_at to staff select query and auth fallback object
- `tests/components/TaskBoard.test.tsx` - Added RequestType/TaskStatus typed Sets, screenshot_url to fixture, removed unused mockOn destructure and hasActiveFilters prop
- `tests/components/TaskRow.test.tsx` - Added screenshot_url: null to mock fixture
- `tests/components/TaskForm.test.tsx` - Updated test to match new "Attach Photo" label
- `tests/routes/auth.test.ts` - Removed unused vi import

## Decisions Made
- Used `search={{ expired: undefined }}` instead of `search={{}}` because TanStack Router requires the search object to match the route's validateSearch schema shape
- Added `created_at` to the staff `.select()` query rather than narrowing the `Staff` type, since Header component expects the full Staff type
- Removed `hasActiveFilters` from TaskBoard's interface entirely since the component never uses it (only FilterBar needs it)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] search={{}} fails TanStack Router type check**
- **Found during:** Task 1
- **Issue:** Plan suggested `search={{}}` for Link components, but TanStack Router requires the search object to match `{ expired: "true" | undefined }` shape
- **Fix:** Changed to `search={{ expired: undefined }}` per plan's fallback suggestion
- **Files modified:** app/routes/signup.tsx
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** b9f244c

**2. [Rule 1 - Bug] Missing created_at in auth staff fallback and select query**
- **Found during:** Task 1
- **Issue:** Staff select query only selected `id, email, display_name` but Header component expects full Staff type including `created_at`. The auth fallback object also lacked `created_at`.
- **Fix:** Added `created_at` to the `.select()` call and added `created_at` to the fallback object using `user.created_at`
- **Files modified:** app/server/auth.ts
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** b9f244c

**3. [Rule 1 - Bug] TaskBoard hasActiveFilters removal required call site update**
- **Found during:** Task 1
- **Issue:** Removing `hasActiveFilters` from TaskBoard props also required removing the prop from the call site in `_auth/index.tsx` and the test fixture
- **Fix:** Removed prop from `_auth/index.tsx` line 168 and test defaultFilterProps
- **Files modified:** app/routes/_auth/index.tsx, tests/components/TaskBoard.test.tsx
- **Verification:** `npx tsc --noEmit` passes, tests pass
- **Committed in:** b9f244c

**4. [Rule 1 - Bug] TaskBoard test Set<string> incompatible with Set<RequestType>**
- **Found during:** Task 1
- **Issue:** Plan suggested `new Set<TaskStatus>()` for both Sets, but `requestTypes` needs `Set<RequestType>` type
- **Fix:** Used `new Set<RequestType>()` for requestTypes, imported RequestType type
- **Files modified:** tests/components/TaskBoard.test.tsx
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** b9f244c

**5. [Rule 1 - Bug] Unused vi import in auth.test.ts**
- **Found during:** Task 1
- **Issue:** TS6133 error for unused `vi` import not mentioned in plan
- **Fix:** Removed `vi` from import statement
- **Files modified:** tests/routes/auth.test.ts
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** b9f244c

**6. [Rule 1 - Bug] TaskForm test expected old "Attach Screenshot" label**
- **Found during:** Task 1
- **Issue:** Test was looking for "Attach Screenshot" button but label was changed to "Attach Photo"
- **Fix:** Updated test to match new label
- **Files modified:** tests/components/TaskForm.test.tsx
- **Verification:** Test passes
- **Committed in:** b9f244c

---

**Total deviations:** 6 auto-fixed (6 bugs)
**Impact on plan:** All auto-fixes were direct consequences of the planned changes. No scope creep.

## Issues Encountered
- Pre-existing test failure in `tests/components/TaskRow.test.tsx` ("calls onEdit on row click") - the test clicks text inside a `pointer-events-none` container, so the click never reaches the overlay. This was failing before Plan 02 changes. Logged to deferred-items.md.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all changes are complete implementations.

## Next Phase Readiness
- Phase 05 (bug-fixes) is complete: zero tsc errors, mobile photo picker fixed
- Phase 06 (reminders) and Phase 07 (analytics) can proceed without blockers
- One pre-existing test flake should be addressed in a future maintenance pass

---
*Phase: 05-bug-fixes*
*Completed: 2026-04-06*

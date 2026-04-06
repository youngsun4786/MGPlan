---
phase: 05-bug-fixes
plan: 01
subsystem: infra
tags: [typescript, tsconfig, supabase, service-worker]

# Dependency graph
requires: []
provides:
  - "Root tsconfig excluding Deno edge functions and service worker"
  - "Separate tsconfig.sw.json with WebWorker lib and path aliases"
  - "Fresh Supabase database types with Relationships and PostgrestVersion"
affects: [05-02]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Separate tsconfig for service worker (WebWorker lib, independent include)"
    - "Supabase gen types with --project-id for unlinked projects"

key-files:
  created:
    - tsconfig.sw.json
  modified:
    - tsconfig.json
    - app/lib/database.types.ts

key-decisions:
  - "Used --project-id instead of supabase link for type generation (project not linked locally)"
  - "Kept custom helper type exports (Task, TaskInsert, etc.) appended after generated types"

patterns-established:
  - "tsconfig.sw.json: independent SW tsconfig with WebWorker lib, path aliases for IDE support"
  - "Database types regeneration: npx supabase gen types --project-id vszlowexehqxvtvbrawm"

requirements-completed: [FIX-02]

# Metrics
duration: 5min
completed: 2026-04-06
---

# Phase 05 Plan 01: TypeScript Config & Database Types Summary

**Eliminated 36 of 54 tsc errors by excluding Deno/SW from root tsconfig and regenerating Supabase types with full schema metadata**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-06T04:19:03Z
- **Completed:** 2026-04-06T04:24:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Root tsc errors reduced from 54 to 18 (67% reduction)
- Service worker compiles cleanly with dedicated tsconfig (0 errors)
- Supabase `never` type errors on table operations fully resolved by regenerated types with Relationships metadata
- All 68 passing tests continue to pass (1 pre-existing failure unrelated to changes)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix tsconfig -- exclude Deno functions, exclude SW, create SW tsconfig** - `9d87afb` (fix)
2. **Task 2: Regenerate Supabase database types** - `0d27084` (fix)

## Files Created/Modified
- `tsconfig.json` - Added exclude array for supabase/functions/** and app/sw.ts
- `tsconfig.sw.json` - New independent tsconfig with WebWorker lib, path aliases, strict mode
- `app/lib/database.types.ts` - Regenerated from live Supabase schema (109 -> 274 lines)

## Decisions Made
- Used `npx supabase gen types --project-id vszlowexehqxvtvbrawm` since project was not linked locally
- Preserved custom helper type exports (Task, TaskInsert, TaskUpdate, Staff) appended after generated code
- Database types already had screenshot_url and push_subscriptions -- the real fix was adding Relationships and __InternalSupabase metadata that newer @supabase/ssr requires

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Database types were not actually stale -- real issue was missing Relationships metadata**
- **Found during:** Task 2
- **Issue:** Plan assumed types lacked screenshot_url/push_subscriptions (they didn't). The actual cause of `never` type errors was missing `Relationships`, `Views`, `Functions`, `CompositeTypes`, and `__InternalSupabase` fields that newer @supabase/ssr expects
- **Fix:** Regenerated types from live schema which includes all required metadata fields
- **Files modified:** app/lib/database.types.ts
- **Verification:** 9 additional errors resolved (27 -> 18), no `never` type errors on Supabase operations
- **Committed in:** 0d27084

---

**Total deviations:** 1 auto-fixed (1 bug diagnosis correction)
**Impact on plan:** Same outcome achieved, just different root cause than expected. No scope creep.

## Issues Encountered
- Supabase project not linked locally -- resolved by using `--project-id` flag with project ref from `supabase projects list`

## Remaining Errors (18)
The 18 remaining errors are Group D localized fixes for Plan 02:
- 7x test fixtures missing `screenshot_url` in TaskWithStaff mocks
- 4x TaskBoard test prop type mismatches
- 2x TanStack Router `search` prop on Link components (signup.tsx)
- 2x unused variable warnings (TS6133)
- 1x push.ts Uint8Array type mismatch
- 1x TaskRow.tsx onClick handler type
- 1x auth index.tsx missing created_at on staff object

## Next Phase Readiness
- Plan 02 can now focus on the 18 remaining localized type errors
- No config-level blockers remain
- Service worker has clean compilation path via tsconfig.sw.json

---
*Phase: 05-bug-fixes*
*Completed: 2026-04-06*

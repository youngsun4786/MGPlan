---
phase: 01-foundation-core-board
plan: 01
subsystem: infra
tags: [tanstack-start, supabase, vite, tailwind, shadcn, vitest, typescript]

# Dependency graph
requires: []
provides:
  - TanStack Start project scaffold with Vite, TypeScript strict, Tailwind CSS
  - Supabase database migration (staff, tasks tables, enums, RLS, triggers)
  - Typed Supabase browser and server clients with Database generic
  - shadcn UI components (button, input, select, dialog, dropdown-menu, label, badge)
  - Shared constants (TASK_STATUS, REQUEST_TYPE) with label maps
  - cn() and formatRelativeTime() utilities
  - Vitest test infrastructure with 35 todo stubs
affects: [01-02, 01-03, 01-04, 01-05]

# Tech tracking
tech-stack:
  added: ["@tanstack/react-start", "@supabase/supabase-js", "@supabase/ssr", "react-hook-form", "@hookform/resolvers", "zod", "@tanstack/zod-adapter", "clsx", "tailwind-merge", "lucide-react", "shadcn", "vitest", "@testing-library/react", "@testing-library/jest-dom"]
  patterns: ["srcDirectory: app for TanStack Start", "VITEST conditional tanstackStart disable", "cn() utility", "const enum objects with label maps"]

key-files:
  created:
    - vite.config.ts
    - app/routes/__root.tsx
    - app/lib/supabase.client.ts
    - app/lib/supabase.server.ts
    - app/lib/database.types.ts
    - app/lib/constants.ts
    - app/lib/utils.ts
    - supabase/migrations/0001_initial.sql
    - tests/setup.ts
  modified:
    - package.json
    - tsconfig.json

key-decisions:
  - "Removed app.config.ts: @tanstack/react-start/config module no longer exists in current version; Vercel deployment handled at platform level"
  - "Used srcDirectory: app instead of default src for TanStack Start route discovery"
  - "Added vitest globals: true for @testing-library/jest-dom compatibility"
  - "Used type guard filter on parseCookieHeader output to satisfy strict types for createServerClient"

patterns-established:
  - "srcDirectory: 'app' in tanstackStart() config for app/ directory convention"
  - "VITEST=true env var to conditionally disable tanstackStart plugin during tests"
  - "globals: true in vitest config for jest-dom expect.extend compatibility"
  - "~/* path alias mapping to ./app/* via tsconfig paths"

requirements-completed: [TASK-02, TASK-07]

# Metrics
duration: 13min
completed: 2026-04-01
---

# Phase 1 Plan 01: Project Foundation Summary

**TanStack Start scaffold with Supabase schema, typed clients, shadcn components, and vitest test infrastructure covering 35 requirement stubs**

## Performance

- **Duration:** 13 min
- **Started:** 2026-04-02T00:12:42Z
- **Completed:** 2026-04-02T00:26:30Z
- **Tasks:** 3
- **Files modified:** 21

## Accomplishments
- Full TanStack Start project with Vite, TypeScript strict, Tailwind CSS v4, and 7 shadcn components
- Complete Supabase migration with staff/tasks tables, Postgres enums, RLS policies, auto-signup trigger, and realtime publication
- Typed Supabase clients (browser + server) with Database generic and shared constants with label maps
- Vitest test infrastructure with 35 todo stubs across 5 test files covering AUTH-01, AUTH-03, TASK-01-08, RT-01, RT-02

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold TanStack Start project and install all dependencies** - `380e187` (feat)
2. **Task 2: Create Supabase migration, typed clients, and shared constants** - `96d5ab1` (feat)
3. **Task 3: Create test infrastructure** - `f07e77f` (test)

## Files Created/Modified
- `vite.config.ts` - Vite config with tanstackStart (srcDirectory: app), vitest inline config
- `tsconfig.json` - TypeScript strict mode with ~/* path alias to ./app/*
- `package.json` - All dependencies including supabase, react-hook-form, zod, shadcn
- `app/routes/__root.tsx` - Root route with lang="ko", HeadContent, global CSS
- `app/routes/index.tsx` - Placeholder index route
- `app/router.tsx` - TanStack router setup with route tree
- `app/styles/globals.css` - Tailwind v4 with shadcn theme variables
- `app/lib/supabase.client.ts` - Browser Supabase client with Database generic
- `app/lib/supabase.server.ts` - Server Supabase client with cookie handling
- `app/lib/database.types.ts` - Manual Database types (Task, TaskInsert, TaskUpdate, Staff)
- `app/lib/constants.ts` - TASK_STATUS, REQUEST_TYPE consts with label maps
- `app/lib/utils.ts` - cn() and formatRelativeTime() utilities
- `app/components/ui/*.tsx` - 7 shadcn components (button, input, select, dialog, dropdown-menu, label, badge)
- `supabase/migrations/0001_initial.sql` - Complete schema with enums, tables, RLS, triggers
- `tests/setup.ts` - @testing-library/jest-dom setup
- `tests/server/tasks.test.ts` - 10 todo stubs for task CRUD
- `tests/routes/auth.test.ts` - 5 todo stubs for auth flow
- `tests/components/TaskBoard.test.tsx` - 7 todo stubs for board component
- `tests/components/TaskRow.test.tsx` - 6 todo stubs for row component
- `tests/components/TaskForm.test.tsx` - 7 todo stubs for form component
- `components.json` - shadcn configuration
- `.env.example` - Required environment variables
- `.prettierrc` - Code formatting config
- `.gitignore` - Node/Vite/Tanstack ignores

## Decisions Made
- **Removed app.config.ts:** `@tanstack/react-start/config` module no longer exists in the current TanStack Start version. The plan specified creating this file with `preset: 'vercel'`, but the Vercel deployment is now handled at the platform level, not via a config file.
- **Used srcDirectory: 'app':** TanStack Start defaults to `src/` for routes. Configured `srcDirectory: 'app'` in tanstackStart() plugin options to match the project's `app/` directory convention.
- **Added vitest globals: true:** `@testing-library/jest-dom` v6 calls `expect.extend()` at import time, requiring `expect` to be globally available. Without `globals: true`, all test files fail during setup.
- **Type guard on parseCookieHeader:** The `parseCookieHeader` return type has `value?: string | undefined` but `createServerClient` requires `value: string`. Added a type-narrowing filter to satisfy strict TypeScript.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] app.config.ts module path does not exist**
- **Found during:** Task 1 (project scaffold)
- **Issue:** Plan specified `import { defineConfig } from '@tanstack/react-start/config'` but this module is not exported in the current @tanstack/react-start version
- **Fix:** Removed app.config.ts entirely; Vercel preset is unnecessary with current TanStack Start
- **Files modified:** app.config.ts (deleted)
- **Verification:** Dev server starts and responds HTTP 200
- **Committed in:** 380e187

**2. [Rule 1 - Bug] parseCookieHeader type incompatibility**
- **Found during:** Task 2 (Supabase server client)
- **Issue:** `parseCookieHeader` returns `{name: string, value?: string}[]` but `getAll` expects `{name: string, value: string}[]`
- **Fix:** Added `.filter()` with type guard to narrow `value` from `string | undefined` to `string`
- **Files modified:** app/lib/supabase.server.ts
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** 96d5ab1

**3. [Rule 3 - Blocking] vitest globals needed for jest-dom**
- **Found during:** Task 3 (test infrastructure)
- **Issue:** `@testing-library/jest-dom` calls `expect.extend()` at module load, but `expect` is not defined without vitest globals
- **Fix:** Added `globals: true` to vitest test config in vite.config.ts
- **Files modified:** vite.config.ts
- **Verification:** `npx vitest run` discovers all 35 stubs with no failures
- **Committed in:** f07e77f

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
- TanStack Start scaffolding CLI changed from `create-tsrouter-app` (deprecated) to `@tanstack/cli create`. The old CLI rejects project names starting with a period. Used the new CLI successfully.
- TanStack Start no longer uses Vinxi/Nitro for deployment presets. The `app.config.ts` pattern from the plan is obsolete. Vercel deployment works via platform detection without explicit preset configuration.

## Known Stubs
None - database.types.ts contains manual type definitions that match the migration schema. These will be replaced by `supabase gen types` when a Supabase project is provisioned, but the current types are functionally complete and accurate.

## User Setup Required
None - no external service configuration required for this plan. Supabase project provisioning is deferred to deployment.

## Next Phase Readiness
- Project scaffold complete with all dependencies, ready for Plans 02-05
- Database migration SQL ready to apply when Supabase project is provisioned
- Typed Supabase clients ready for auth (Plan 02) and server functions (Plan 03)
- shadcn components installed for UI development (Plans 04, 05)
- Test infrastructure ready with stubs that Plans 02-05 will implement

---
*Phase: 01-foundation-core-board*
*Completed: 2026-04-01*

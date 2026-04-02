---
phase: 01-foundation-core-board
plan: 03
subsystem: data
tags: [zod, server-functions, crud, validation, tanstack-start]

# Dependency graph
requires:
  - 01-01 (project scaffold, supabase client, database types, constants)
provides:
  - Task CRUD server functions (createTask, updateTask, updateTaskStatus, deleteTask, fetchTasks)
  - Zod validation schemas for all task operations
  - Schema test suite (13 tests)
affects:
  - 01-04 (board UI consumes fetchTasks, updateTaskStatus)
  - 01-05 (task form consumes createTask, updateTask, deleteTask)

# Tech stack
added: ["@tanstack/zod-adapter"]
patterns: ["createServerFn builder API", "zodValidator for input validation", "getWebRequest for cookie auth", "explicit FK constraint hint for Supabase joins"]

# Key files
created:
  - app/lib/schemas.ts
  - app/server/tasks.ts
modified:
  - tests/server/tasks.test.ts

# Decisions
key-decisions:
  - "Used .trim().min(1) on client_name and phone to reject whitespace-only inputs"
  - "Separate updateTaskStatus schema for lightweight badge cycling vs full updateTask"
  - "Explicit FK constraint hint staff!tasks_last_updated_by_fkey for unambiguous join"
  - "All mutations verify auth and set last_updated_by to current user ID"

# Metrics
duration: 2min
completed: 2026-04-02
tasks_completed: 2
tasks_total: 2
files_created: 2
files_modified: 1
---

# Phase 01 Plan 03: Task CRUD Server Functions Summary

Zod validation schemas with .trim() whitespace rejection plus five TanStack Start server functions (fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask) using builder API with zodValidator and cookie-based auth.

## What Was Built

### Task 1: Zod Validation Schemas (app/lib/schemas.ts)
- `createTaskSchema` -- validates client_name, phone, request_type with .trim().min(1) for whitespace-only rejection
- `updateTaskSchema` -- partial updates with UUID id required
- `updateTaskStatusSchema` -- lightweight status-only cycling
- `deleteTaskSchema` -- UUID validation for deletion
- All enum values match Postgres enums exactly (new_booking, change_time, change_therapist, other / open, in_progress, done)

### Task 2: CRUD Server Functions (app/server/tasks.ts)
- `fetchTasks` -- GET, returns all tasks ordered by created_at ASC (FIFO), joins staff display_name via explicit FK hint
- `createTask` -- POST with zodValidator, inserts task with created_by and last_updated_by set to current user
- `updateTask` -- POST with zodValidator, partial field updates, sets last_updated_by
- `updateTaskStatus` -- POST with zodValidator, status-only update for badge cycling
- `deleteTask` -- POST with zodValidator, deletes by UUID
- All functions use getWebRequest() for cookie-based auth, verify user before mutation

### Task 2: Schema Tests (tests/server/tasks.test.ts)
- 13 tests all passing
- Covers: valid input, empty fields, whitespace-only rejection, invalid enums, UUID validation, partial updates

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 00b4d91 | Zod validation schemas for task operations |
| 2 | 27ef759 | Task CRUD server functions and schema tests |

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

None -- all server functions are fully implemented with real Supabase queries.

## Verification Results

- All 13 Zod schema tests pass (vitest)
- TypeScript compiles (pre-existing tsconfig warnings unrelated to this plan)
- No select('*') usage -- all queries use explicit column lists
- All mutations check auth and set last_updated_by
- fetchTasks uses explicit FK constraint hint for staff join

## Self-Check: PASSED

- All 3 files found on disk
- Both commits (00b4d91, 27ef759) verified in git log

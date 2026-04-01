---
phase: 1
slug: foundation-core-board
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-01
updated: 2026-04-01
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vite.config.ts (inline `test` block with VITEST guard) |
| **Test directory** | `tests/` (canonical — all test files live here) |
| **Setup file** | `tests/setup.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-03 | 01 | 0 | (infra) | setup | `npx vitest run` | Wave 0 | pending |
| 1-02-02 | 02 | 1 | AUTH-01, AUTH-03 | unit | `npx vitest run tests/routes/auth.test.ts` | Wave 0 stub -> Plan 02 impl | pending |
| 1-03-02 | 03 | 1 | TASK-01, TASK-02, TASK-04, TASK-05, TASK-06, TASK-08 | unit | `npx vitest run tests/server/tasks.test.ts` | Wave 0 stub -> Plan 03 impl | pending |
| 1-04-03 | 04 | 2 | TASK-03, TASK-07, RT-01, RT-02 | component | `npx vitest run tests/components/TaskBoard.test.tsx tests/components/TaskRow.test.tsx` | Wave 0 stub -> Plan 04 impl | pending |
| 1-05-03 | 05 | 3 | TASK-08 | component | `npx vitest run tests/components/TaskForm.test.tsx` | Wave 0 stub -> Plan 05 impl | pending |
| 1-05-04 | 05 | 3 | RT-01, RT-02 | manual | See Manual Verifications | N/A | pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements (created in Plan 01, Task 3)

- [ ] `tests/setup.ts` — `@testing-library/jest-dom` import
- [ ] `tests/server/tasks.test.ts` — stubs for TASK-01, TASK-02, TASK-04, TASK-05, TASK-06
- [ ] `tests/routes/auth.test.ts` — stubs for AUTH-01, AUTH-03
- [ ] `tests/components/TaskBoard.test.tsx` — stubs for TASK-03, RT-01, RT-02
- [ ] `tests/components/TaskRow.test.tsx` — stubs for TASK-07
- [ ] `tests/components/TaskForm.test.tsx` — stubs for TASK-08
- [ ] vitest configured in `vite.config.ts` with `process.env.VITEST !== 'true'` guard (avoids TanStack Start plugin conflict)
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`

---

## Test Stub -> Implementation Lifecycle

Each test file follows this lifecycle:
1. **Wave 0 (Plan 01):** Created as `it.todo()` stubs — vitest discovers them but they don't fail
2. **Feature plan:** When the feature is implemented, the same plan replaces `it.todo()` with actual test bodies
3. **Verification:** `npx vitest run {file}` must pass after the feature plan completes

| Test File | Created In | Implemented In |
|-----------|-----------|----------------|
| `tests/routes/auth.test.ts` | Plan 01 (stub) | Plan 02 |
| `tests/server/tasks.test.ts` | Plan 01 (stub) | Plan 03 |
| `tests/components/TaskBoard.test.tsx` | Plan 01 (stub) | Plan 04 |
| `tests/components/TaskRow.test.tsx` | Plan 01 (stub) | Plan 04 |
| `tests/components/TaskForm.test.tsx` | Plan 01 (stub) | Plan 05 |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real-time board updates appear across devices | RT-01, RT-02 | Requires two live browser sessions + Supabase Realtime subscription | Open app in two browsers, create task in one, confirm it appears in the other within 2s |
| Protected routes redirect unauthenticated users | AUTH-03 | Requires real Supabase session state | Navigate to / while logged out, confirm redirect to /login |
| Status transitions reflect immediately | TASK-04 | Requires real Realtime subscription | Change task status, confirm badge updates in second session |
| Session persists across refresh | AUTH-02 | Requires real browser cookies | Login, refresh page, confirm still logged in |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands running vitest (not just tsc)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter
- [x] Test file paths use `tests/` directory (aligned with RESEARCH.md)

**Approval:** pending (Wave 0 not yet executed)

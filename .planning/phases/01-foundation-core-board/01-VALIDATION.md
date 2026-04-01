---
phase: 1
slug: foundation-core-board
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vite.config.ts (with VITEST guard) |
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
| 1-01-01 | 01 | 0 | AUTH-01 | unit | `npx vitest run src/lib/auth` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 0 | AUTH-02 | unit | `npx vitest run src/lib/supabase` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 0 | TASK-01 | unit | `npx vitest run src/lib/tasks` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 1 | RT-01 | manual | See Manual Verifications | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/auth.test.ts` — stubs for AUTH-01, AUTH-02, AUTH-03
- [ ] `src/lib/tasks.test.ts` — stubs for TASK-01 through TASK-08
- [ ] `src/lib/supabase.test.ts` — stubs for Supabase client/SSR wiring
- [ ] vitest configured with `process.env.VITEST !== 'true'` guard in `vite.config.ts` (avoids TanStack Start plugin conflict)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real-time board updates appear across devices | RT-01, RT-02 | Requires two live browser sessions + Supabase Realtime subscription | Open app in two browsers, create task in one, confirm it appears in the other within 2s |
| Protected routes redirect unauthenticated users | AUTH-03 | Requires real Supabase session state | Navigate to /board while logged out, confirm redirect to /login |
| Status transitions reflect immediately | TASK-05 | Requires real Realtime subscription | Change task status, confirm badge updates in second session |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---
phase: 04
slug: filters-search-hardening
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-03
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x + @testing-library/react |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 04-01-01 | 01 | 1 | FILT-01, FILT-02, FILT-03, FILT-04 | unit (TDD) | `npx vitest run tests/lib/filters.test.ts` | ⬜ pending |
| 04-01-02 | 01 | 1 | FILT-01, FILT-02, FILT-03, FILT-04 | build | `npx vitest run` | ⬜ pending |
| 04-01-03 | 01 | 1 | FILT-01, FILT-02, FILT-03, FILT-04 | build | `npx vitest run` | ⬜ pending |
| 04-02-01 | 02 | 2 | FILT-01, FILT-02, FILT-03, FILT-04 | integration | `npx vitest run` | ⬜ pending |
| 04-02-02 | 02 | 2 | FILT-01, FILT-02, FILT-03, FILT-04 | integration | `npx vitest run` | ⬜ pending |
| 04-03-01 | 03 | 3 | QA pass | a11y + hardening | `npx vitest run` | ⬜ pending |
| 04-03-02 | 03 | 3 | FILT-01, FILT-02, FILT-03, FILT-04 | checkpoint | manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No Wave 0 stubs needed. Task 04-01-01 creates `tests/lib/filters.test.ts` as part of its TDD RED phase. All subsequent tasks verify via `npx vitest run` (full suite).

*Existing infrastructure covers test framework — vitest and testing-library already installed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cross-browser smoke | QA pass | Requires real browsers | Test on iOS Safari, Android Chrome, macOS Chrome, Windows Chrome |
| Lighthouse audit | QA pass | Requires browser DevTools | Run Lighthouse in Chrome DevTools, target 90+ mobile |
| RLS audit | QA pass | Requires Supabase Dashboard | Verify policies in Dashboard -> Auth -> Policies |
| Mobile filter bar usability | FILT-01-04 | Touch target / overflow | Test on 375px viewport with touch |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or are manual checkpoints
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] No phantom Wave 0 references — test file created by Task 04-01-01 TDD
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

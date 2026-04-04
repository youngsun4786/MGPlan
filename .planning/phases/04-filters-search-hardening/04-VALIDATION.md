---
phase: 04
slug: filters-search-hardening
status: draft
nyquist_compliant: false
wave_0_complete: false
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

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | FILT-01 | unit | `npx vitest run tests/components/FilterBar.test.tsx` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | FILT-02 | unit | `npx vitest run tests/components/FilterBar.test.tsx` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | FILT-03 | unit | `npx vitest run tests/components/FilterBar.test.tsx` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 1 | FILT-04 | unit | `npx vitest run tests/components/FilterBar.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/components/FilterBar.test.tsx` — stubs for FILT-01 through FILT-04
- [ ] `tests/hooks/useFilterState.test.ts` — filter logic unit tests

*Existing infrastructure covers test framework — vitest and testing-library already installed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cross-browser smoke | QA pass | Requires real browsers | Test on iOS Safari, Android Chrome, macOS Chrome, Windows Chrome |
| Lighthouse audit | QA pass | Requires browser DevTools | Run Lighthouse in Chrome DevTools, target 90+ mobile |
| RLS audit | QA pass | Requires Supabase Dashboard | Verify policies in Dashboard → Auth → Policies |
| Mobile filter bar usability | FILT-01-04 | Touch target / overflow | Test on 375px viewport with touch |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

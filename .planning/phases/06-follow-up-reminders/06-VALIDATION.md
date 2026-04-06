---
phase: 6
slug: follow-up-reminders
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x |
| **Config file** | Inline in package.json (`"test": "vitest run"`) |
| **Quick run command** | `npx vitest run tests/server/reminders.test.ts` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/server/reminders.test.ts`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | REM-01 | unit | `npx vitest run tests/server/reminders.test.ts -t "sends reminders"` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | REM-02 | unit | `npx vitest run tests/server/reminders.test.ts -t "notification content"` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | REM-03 | unit | `npx vitest run tests/server/reminders.test.ts -t "skips non-open"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/server/reminders.test.ts` — unit tests for elapsed time formatting, notification payload, and stale task query logic
- [ ] Existing test infrastructure covers framework needs (Vitest already configured)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Push notification arrives on device | REM-01 | Requires real browser + push subscription | Deploy Edge Function, wait for cron trigger, check device |
| pg_cron job runs successfully | REM-01 | Requires Supabase hosted environment | Check `cron.job_run_details` in SQL Editor |
| Vault secrets configured | REM-01 | Deployment-specific values | Verify `vault.decrypted_secrets` returns non-null for `project_url` and `service_role_key` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

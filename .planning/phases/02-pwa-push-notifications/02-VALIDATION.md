---
phase: 2
slug: pwa-push-notifications
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 1 | PWA-01 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | PWA-02 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | PWA-03 | unit | `npx vitest run` | ✅ | ⬜ pending |
| TBD | 02 | 2 | NOTF-01 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | 02 | 2 | NOTF-02 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | 02 | 2 | NOTF-03 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/pwa/manifest.test.ts` — verify manifest.json generation and required fields
- [ ] `tests/pwa/service-worker.test.ts` — verify SW registration and offline shell behavior
- [ ] `tests/push/subscription.test.ts` — verify push subscription CRUD operations
- [ ] `tests/push/notification.test.ts` — verify notification payload construction

*Test stubs created during Wave 0 of execution.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| iOS Safari "Add to Home Screen" | PWA-01 | Requires physical iOS device or simulator with Safari | Open app in iOS Safari → Share → Add to Home Screen → verify standalone launch |
| Android Chrome install prompt | PWA-01 | Requires Android device or emulator with Chrome | Open app in Chrome → verify beforeinstallprompt fires → tap Install → verify standalone launch |
| Push notification display on device | NOTF-01 | Browser push API not available in test environment | Grant permission → create task from another session → verify notification appears on device |
| Offline shell loading | PWA-02 | Requires network throttling in real browser | Install PWA → enable airplane mode → launch app → verify branded shell with offline message |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

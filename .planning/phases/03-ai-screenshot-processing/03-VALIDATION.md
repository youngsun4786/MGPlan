---
phase: 03
slug: ai-screenshot-processing
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-03
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.0.5 |
| **Config file** | `vite.config.ts` (vitest config section) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | AI-01 | unit | `npx vitest run tests/server/screenshot.test.ts -t "file validation"` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | AI-02 | unit (mocked API) | `npx vitest run tests/server/screenshot.test.ts -t "extraction"` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | AI-03 | unit | `npx vitest run tests/components/TaskForm.test.tsx -t "pre-fill"` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | AI-04 | unit | `npx vitest run tests/components/ConfidenceIndicator.test.tsx` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 1 | AI-05 | unit | `npx vitest run tests/components/ScreenshotUpload.test.tsx -t "fallback"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/server/screenshot.test.ts` — stubs for AI-01, AI-02 (mock Anthropic SDK, validate extraction schema)
- [ ] `tests/components/ConfidenceIndicator.test.tsx` — covers AI-04
- [ ] `tests/components/ScreenshotUpload.test.tsx` — covers AI-01, AI-05 (file validation, fallback flow)
- [ ] `tests/components/TaskForm.test.tsx` — covers AI-03 (pre-fill via reset)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real KakaoTalk screenshot extraction accuracy | AI-02 | Requires real screenshots with mixed Korean/English; prompt accuracy is empirical | Upload 3+ real KakaoTalk screenshots, verify extracted fields match actual content |
| Mobile camera capture flow | AI-01 | Requires physical device camera interaction | On mobile device, tap upload, select camera, take photo, verify form pre-fills |
| HEIC conversion on iOS Safari | AI-01 | Requires iOS device with HEIC default | Take photo on iPhone, upload via Safari, verify JPEG conversion and extraction |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

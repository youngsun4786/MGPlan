# Project State: Massage Shop Task Manager

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-31)

**Core value:** Every incoming call gets logged and followed up — zero leads fall through the cracks.
**Current focus:** Phase 1 - Foundation & Core Board (Plan 01 complete)

## Current Position

- **Milestone:** v1.0
- **Active phase:** 01-foundation-core-board
- **Current Plan:** 2 of 5
- **Next action:** Execute Plan 02 (Auth)

## Phase Status

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation & Core Board | In Progress (1/5 plans complete) |
| 2 | PWA + Push Notifications | Not started |
| 3 | AI Screenshot Processing | Not started |
| 4 | Filters, Search & Hardening | Not started |

## Tech Stack

- **Framework:** TanStack Start (Vite, TypeScript)
- **Database / Auth / Realtime:** Supabase
- **AI / OCR:** Claude API (vision)
- **Push notifications:** Web Push + VAPID
- **PWA:** vite-plugin-pwa / Workbox
- **Styling:** Tailwind CSS v4 + shadcn
- **Deployment:** Vercel + Supabase cloud

## Key Decisions

- TanStack Start chosen over Next.js (user preference, Vite-based)
- Supabase for hosted Postgres + realtime + auth (no server to manage)
- Claude vision for screenshot OCR (best for mixed Korean/English screenshots)
- Web Push + VAPID over OneSignal (no third-party lock-in, free)
- PWA over native app (avoids app store overhead)
- app.config.ts removed: @tanstack/react-start/config no longer exists; Vercel preset at platform level
- srcDirectory: 'app' for TanStack Start (default is 'src')
- vitest globals: true for @testing-library/jest-dom compatibility

## Performance Metrics

| Phase-Plan | Duration | Tasks | Files |
|------------|----------|-------|-------|
| 01-01      | 13min    | 3     | 21    |

## Open Issues

None.

## Session Continuity

- **Last session:** 2026-04-02T00:26:30Z
- **Stopped at:** Completed 01-01-PLAN.md

---
*State updated: 2026-04-02*

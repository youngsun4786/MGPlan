# Project State: Massage Shop Task Manager

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-31)

**Core value:** Every incoming call gets logged and followed up — zero leads fall through the cracks.
**Current focus:** Not started — run `/gsd:plan-phase 1` to begin.

## Current Position

- **Milestone:** v1.0
- **Active phase:** None
- **Next action:** `/gsd:plan-phase 1` — Foundation & Core Board

## Phase Status

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation & Core Board | 🔲 Not started |
| 2 | PWA + Push Notifications | 🔲 Not started |
| 3 | AI Screenshot Processing | 🔲 Not started |
| 4 | Filters, Search & Hardening | 🔲 Not started |

## Tech Stack

- **Framework:** TanStack Start (Vite, TypeScript)
- **Database / Auth / Realtime:** Supabase
- **AI / OCR:** Claude API (vision)
- **Push notifications:** Web Push + VAPID
- **PWA:** vite-plugin-pwa / Workbox
- **Styling:** Tailwind CSS
- **Deployment:** Vercel + Supabase cloud

## Key Decisions

- TanStack Start chosen over Next.js (user preference, Vite-based)
- Supabase for hosted Postgres + realtime + auth (no server to manage)
- Claude vision for screenshot OCR (best for mixed Korean/English screenshots)
- Web Push + VAPID over OneSignal (no third-party lock-in, free)
- PWA over native app (avoids app store overhead)

## Open Issues

None.

## Session Continuity

*No active session — project freshly initialized.*

---
*State initialized: 2026-03-31*

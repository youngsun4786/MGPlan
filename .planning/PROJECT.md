# Massage Shop Task Manager

## What This Is

A shared task board for a small massage shop (3-5 staff) that captures incoming call leads and change requests. Staff log every call as a task — the whole team sees open items in real time, gets push-notified on new ones, and marks them done after calling back and booking in Fresha. Replaces a chaotic KakaoTalk screenshot workflow where 1-2 leads were missed daily.

## Core Value

Every incoming call gets logged and followed up — zero leads fall through the cracks.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

- [ ] Email/password login for staff
- [ ] Manual task creation form (client name, phone, service, preferred date/time, notes, request type)
- [ ] Request type: New Booking vs Change Request (time change, therapist change, etc.)
- [ ] Shared task board — all staff see all tasks
- [ ] Task status lifecycle: Open → In Progress → Done
- [ ] Real-time board updates across all devices (no refresh needed)
- [ ] Screenshot upload with Claude vision AI auto-fill
- [ ] Push notifications to all staff when new task is created
- [ ] Responsive UI — mobile and desktop
- [ ] PWA installable to home screen (iOS + Android)

### Out of Scope

- Task assignment to specific staff — flat team, everyone handles everything
- Fresha integration — they book there separately, this just tracks the follow-up
- KakaoTalk bot / message ingestion — screenshot upload covers this for v1
- Analytics / reporting — useful later, not needed to solve the core problem
- Native iOS/Android app — PWA covers the use case without app store overhead
- Role-based permissions — 3-5 person flat team, overkill for v1

## Context

- Sister's massage business — small team of 3-5 staff
- Current workflow: missed calls → screenshot → share in KakaoTalk group chat → gets buried → lead missed
- 5-15 calls/day (moderate volume, each one matters)
- Existing booking system: Fresha (separate — this app tracks follow-ups only)
- Staff use both mobile phones and desktop computers
- Korean messenger (KakaoTalk) screenshots contain mixed Korean/English text and call metadata

## Constraints

- **Tech stack**: TanStack Start + Supabase + Claude API + vite-plugin-pwa + Vercel
- **Devices**: Must work on iOS Safari, Android Chrome, and desktop browsers
- **Integration**: No Fresha API integration — standalone task tracker only
- **Scale**: Single shop, 3-5 concurrent users — simplicity over scale

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| TanStack Start over Next.js | User preference; Vite-based, file-based routing, type-safe server functions | — Pending |
| Supabase for DB + auth + realtime | Hosted Postgres, built-in realtime subscriptions, auth out of the box | — Pending |
| Claude API for screenshot OCR | Best vision model for mixed Korean/English noisy screenshots | — Pending |
| Web Push + VAPID over OneSignal | No third-party lock-in, free, works on iOS 16.4+ PWA | — Pending |
| PWA over native app | Avoids app store overhead; covers the mobile use case sufficiently | — Pending |

---
*Last updated: 2026-03-31 after initial project definition*

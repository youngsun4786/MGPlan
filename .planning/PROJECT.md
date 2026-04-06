# Massage Shop Task Manager

## What This Is

A shared task board for a small massage shop (3-5 staff) that captures incoming call leads and change requests. Staff log every call as a task — the whole team sees open items in real time, gets push-notified on new ones, and marks them done after calling back and booking in Fresha. Screenshots of KakaoTalk messages are auto-parsed by Claude Vision to pre-fill the form. Deployed as a PWA installable on iOS and Android.

## Core Value

Every incoming call gets logged and followed up — zero leads fall through the cracks.

## Requirements

### Validated

- ✓ AUTH-01: Staff can sign in with email and password — v1.0
- ✓ AUTH-02: Session persists across browser refresh and app reopen — v1.0
- ✓ AUTH-03: Protected routes redirect unauthenticated users to login — v1.0
- ✓ TASK-01: Manual task creation form with all fields — v1.0
- ✓ TASK-02: Request type supports New Booking, Change Time, Change Therapist, Other — v1.0
- ✓ TASK-03: Shared task board across all staff — v1.0
- ✓ TASK-04: Status transitions Open → In Progress → Done — v1.0
- ✓ TASK-05: Staff can edit a task after creation — v1.0
- ✓ TASK-06: Staff can delete a task — v1.0
- ✓ TASK-07: Task shows last updater and timestamp — v1.0
- ✓ TASK-08: Form validates required fields with error messages — v1.0
- ✓ RT-01: Real-time board updates across devices — v1.0
- ✓ RT-02: New tasks appear instantly on all sessions — v1.0
- ✓ AI-01: Screenshot upload (drag-and-drop / tap) — v1.0
- ✓ AI-02: Claude vision extracts fields from screenshots — v1.0
- ✓ AI-03: Extracted fields pre-fill the form — v1.0
- ✓ AI-04: Low-confidence fields visually flagged — v1.0
- ✓ AI-05: Unreadable screenshots fall back to manual entry — v1.0
- ✓ NOTF-01: Push notification on new task creation — v1.0
- ✓ NOTF-02: Push notification includes client name and request type — v1.0
- ✓ NOTF-03: Staff can grant/deny push permission in-app — v1.0
- ✓ PWA-01: Installable on iOS Safari and Android Chrome — v1.0
- ✓ PWA-02: Offline shell when network unavailable — v1.0
- ✓ PWA-03: Responsive UI on mobile (375px+) and desktop (1024px+) — v1.0
- ✓ FILT-01: Filter by status — v1.0
- ✓ FILT-02: Filter by request type — v1.0
- ✓ FILT-03: Filter by date range — v1.0
- ✓ FILT-04: Search by client name or phone — v1.0
- ✓ FIX-01: Mobile photo picker allows library selection — v1.1 Phase 5
- ✓ FIX-02: Zero TypeScript errors (tsc --noEmit clean) — v1.1 Phase 5

### Active

- [ ] Automated follow-up reminders when task stays Open >X hours
- [ ] Analytics dashboard: calls/day, calls/week, avg Open→Done time, request type breakdown

### Out of Scope

- Task assignment to specific staff — flat team, everyone handles everything
- Fresha integration — they book there separately, this just tracks follow-up
- KakaoTalk bot / message ingestion — screenshot upload covers this
- ~~Analytics / reporting~~ — moved to Active for v1.1
- Native iOS/Android app — PWA covers the use case
- Role-based permissions — 3-5 person flat team

## Context

Shipped v1.0 with ~3,900 LOC TypeScript across 143 files.
Tech stack: TanStack Start, Supabase, Claude Vision API, Tailwind CSS v4, shadcn/ui.
Deployed on Vercel as a PWA with Web Push notifications via Supabase Edge Functions.
Email allowlist restricts signups to approved staff only (ALLOWED_SIGNUP_EMAILS env var).
5 days from project init to production deployment (2026-03-31 → 2026-04-05).

## Constraints

- **Tech stack**: TanStack Start + Supabase + Claude API + vite-plugin-pwa + Vercel
- **Devices**: Must work on iOS Safari, Android Chrome, and desktop browsers
- **Integration**: No Fresha API integration — standalone task tracker only
- **Scale**: Single shop, 3-5 concurrent users — simplicity over scale

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| TanStack Start over Next.js | User preference; Vite-based, file-based routing, type-safe server functions | ✓ Good |
| Supabase for DB + auth + realtime | Hosted Postgres, built-in realtime subscriptions, auth out of the box | ✓ Good |
| Claude API for screenshot OCR | Best vision model for mixed Korean/English noisy screenshots | ✓ Good |
| Web Push + VAPID over OneSignal | No third-party lock-in, free, works on iOS 16.4+ PWA | ✓ Good |
| PWA over native app | Avoids app store overhead; covers the mobile use case sufficiently | ✓ Good |
| Server-side email allowlist | Prevents unauthorized signups; configurable via env var without code changes | ✓ Good |

## Current Milestone: v1.1 Reminders, Analytics & Fixes

**Goal:** Keep tasks from going stale with automated reminders, give visibility into call patterns, and fix production issues.

**Target features:**
- ~~Fix mobile photo picker and TypeScript errors~~ ✓ Phase 5 complete
- Automated push reminders to all staff when tasks stay Open too long
- Analytics dashboard with 3 key metrics: volume, response time, request mix

---
*Last updated: 2026-04-06 after Phase 5 (Bug Fixes) complete*

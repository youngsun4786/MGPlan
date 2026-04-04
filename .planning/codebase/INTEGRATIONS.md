# External Integrations

**Analysis Date:** 2026-04-01
**Project Status:** Greenfield — planning phase. All integrations are planned, none are implemented.

---

## Supabase

**Category:** Database / Auth / Realtime
**Status:** Planned — Phase 1

**What it does:**
Supabase serves three distinct roles in this project, all under one hosted service:

1. **Postgres database** — primary data store for `tasks` and `staff` tables. Row-Level Security (RLS) policies enforce that only authenticated staff can read and write tasks.
2. **Auth** — email/password authentication for staff. Sessions persist across browser refresh and app reopen (AUTH-01, AUTH-02). Protected routes redirect unauthenticated users (AUTH-03).
3. **Realtime subscriptions** — Postgres change feeds streamed to connected clients via Supabase Realtime channels. Task board updates live across all open sessions without page refresh (RT-01, RT-02).

**Push dispatch (Phase 2):** A Supabase Database Webhook or Edge Function fires on task `INSERT` to dispatch Web Push notifications to all subscribers.

**Why chosen:** Hosted Postgres eliminates server management; realtime and auth are built-in, avoiding additional services. Single provider for DB + auth + realtime reduces operational complexity for a small team project.

**SDK/Client:**
- `@supabase/supabase-js` — used on both client and server (server uses service role key)

**Auth:**
- `SUPABASE_URL` — project URL
- `SUPABASE_ANON_KEY` — public key for client-side operations
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only; used for admin operations and push dispatch

**Constraints:**
- RLS policies must be carefully authored — all queries run under the anon or authenticated role
- Realtime subscriptions require an active network connection; offline shell (PWA-02) degrades gracefully without live data
- Supabase free tier is sufficient for single-shop scale (3-5 concurrent users, 5-15 tasks/day)

---

## Claude API (Anthropic)

**Category:** AI / Vision OCR
**Status:** Planned — Phase 3

**What it does:**
Processes KakaoTalk screenshot uploads to extract task fields automatically. Staff upload a screenshot (drag-and-drop on desktop, tap-to-upload on mobile); the Claude vision API reads the image and returns structured data:

- Client name
- Phone number
- Service requested
- Preferred date/time
- Notes
- Request type (New Booking / Change Time / Change Therapist / Other)

Extracted fields pre-fill the task creation form (AI-03). Low-confidence fields are visually flagged for staff review (AI-04). Unreadable screenshots fall back to manual entry (AI-05).

**Why chosen:** Claude's vision model handles mixed Korean/English text and noisy messenger screenshots better than generic OCR solutions. The KakaoTalk screenshot format contains call metadata alongside Korean conversation text — a specialized prompt outperforms rule-based parsing.

**Implementation approach:**
- A TanStack Start `createServerFn` handler proxies the image to the Claude API — the API key is never exposed to the client
- Prompt engineered specifically for KakaoTalk screenshot format (mixed Korean/English, call metadata)
- Basic rate limiting on the upload handler to prevent abuse
- Response parsed into structured JSON before returning to client for form pre-fill

**SDK/Client:**
- `@anthropic-ai/sdk` or direct HTTP — called only from server functions

**Auth:**
- `ANTHROPIC_API_KEY` — server-side only, never sent to browser

**Constraints:**
- API calls have latency — upload UI should show a loading state
- Vision API has input size limits — screenshots should be validated before upload
- Cost is per-token; rate limiting is necessary even at low volume
- Extraction accuracy is not guaranteed — staff review before saving is a hard requirement (AI-03, AI-04)

---

## Web Push / VAPID

**Category:** Push Notifications
**Status:** Planned — Phase 2

**What it does:**
Delivers push notifications to all staff devices when a new task is created (NOTF-01). Notification payload includes client name and request type (NOTF-02). Staff grant or deny push permission from within the app (NOTF-03).

Flow:
1. Staff grant push permission in the browser
2. Browser generates a push subscription (endpoint + keys) using the VAPID public key
3. Subscription stored in Supabase (linked to staff record)
4. On task `INSERT`, a Supabase Database Webhook or Edge Function retrieves all active subscriptions and dispatches VAPID-signed push messages to each endpoint
5. Service worker (Workbox) receives the push event and displays the notification

**Why chosen over OneSignal:** No third-party service dependency, no per-notification cost, no vendor lock-in. Web Push + VAPID is a browser-native standard. Works on iOS Safari 16.4+ when installed as a PWA, and on Android Chrome.

**SDK/Client:**
- `web-push` (Node.js) — VAPID key generation and push message signing/dispatch, used in server function or Edge Function

**Auth:**
- `VAPID_PUBLIC_KEY` — sent to browser for push subscription creation (safe to expose)
- `VAPID_PRIVATE_KEY` — server-side only; signs push messages
- `VAPID_SUBJECT` — contact email or URL (required by VAPID spec)

**Constraints:**
- iOS push requires PWA to be installed to home screen (PWA-01); push does not work in mobile Safari without installation
- iOS 16.4 minimum for push support — older devices will not receive notifications
- Push subscriptions can expire or be revoked — subscription table needs cleanup logic (v1 can tolerate stale entries)
- Permission prompt is browser-native and can only be shown once without user reset

---

## Vercel

**Category:** Deployment / Hosting
**Status:** Planned — Phase 1

**What it does:**
Hosts the TanStack Start application. The Vercel adapter transforms TanStack Start's SSR and `createServerFn` handlers into Vercel serverless functions. Static assets are served from Vercel's CDN.

**Why chosen:** Natural fit for Vite-based frameworks with SSR; zero-config deployment from git; serverless functions handle server-side logic (Claude proxy, push dispatch if not using Supabase Edge Functions) without managing infrastructure.

**Auth:**
- Environment variables set in Vercel project settings (mirrors `.env` for production)

**Constraints:**
- Serverless function cold starts may add latency to first `createServerFn` call — acceptable at this scale
- Vercel free tier is sufficient for single-shop traffic
- Long-running operations (e.g., waiting for Claude API) must complete within Vercel's function timeout (default 10s on hobby plan, 60s on pro)

---

## Fresha

**Category:** Booking System
**Status:** Explicitly OUT OF SCOPE

**Why not integrated:**
Fresha is the existing booking system used by the massage shop. This application is a task tracker for follow-up calls only — staff continue to book appointments in Fresha separately. There is no Fresha API integration planned for v1 or v2.

This is an intentional boundary: the app tracks whether a lead was followed up, not the booking outcome. Fresha owns client history and booking data; this app owns the call queue.

**Future consideration:** Not planned. The core value proposition does not require reading from or writing to Fresha.

---

## KakaoTalk

**Category:** Messenger (source of screenshots, not integrated)
**Status:** NOT integrated — screenshot upload covers v1

**Why not integrated:**
Direct KakaoTalk bot or message ingestion requires KakaoTalk API access, which adds significant complexity. The screenshot upload + Claude vision approach covers the same workflow: staff share the screenshot in KakaoTalk, then upload it to this app. A KakaoTalk bot is listed as a potential v2+ enhancement but is explicitly out of scope for v1.

---

## Summary

| Integration | Role | Phase | Status |
|-------------|------|-------|--------|
| Supabase (Postgres) | Primary database | 1 | Planned |
| Supabase (Auth) | Email/password auth | 1 | Planned |
| Supabase (Realtime) | Live board updates | 1 | Planned |
| Supabase (Webhook/Edge Function) | Push dispatch trigger | 2 | Planned |
| Claude API (vision) | Screenshot OCR / auto-fill | 3 | Planned |
| Web Push / VAPID | Push notifications to staff | 2 | Planned |
| Vercel | Deployment + hosting | 1 | Planned |
| Fresha | Booking system | — | Out of scope |
| KakaoTalk API | Messenger ingestion | — | Out of scope (v1) |

---

*Integration audit: 2026-04-01 — based on planning documents, pre-implementation*

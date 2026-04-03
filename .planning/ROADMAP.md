# Roadmap: Massage Shop Task Manager

**Milestone:** v1.0 — Core product
**Goal:** Staff log every call, see the board in real time, get push-notified, and can upload screenshots for AI auto-fill. Zero leads missed.

---

## Phase 1: Foundation & Core Board

**Goal:** Working task board end-to-end. Auth, database, task CRUD, and live real-time updates. Staff can log in, create tasks manually, and see changes appear instantly across all devices.

**Stack setup:**
- TanStack Start project scaffolded (Vite, TypeScript, Tailwind CSS)
- Supabase project provisioned (Postgres schema, RLS policies, auth config)
- Deployed to Vercel via TanStack Start Vercel adapter

**Deliverables:**
- Email/password login with protected routes (Supabase Auth)
- Database schema: `tasks`, `staff` tables with RLS policies
- Manual task creation form — all fields (client name, phone, service, date/time, notes, request type)
- Task board showing all open tasks, shared across all staff
- Status transitions: Open → In Progress → Done
- Edit and delete tasks
- Last-modified-by + timestamp on each task
- Form validation with error messages
- Real-time board updates via Supabase Realtime subscriptions
- Responsive Tailwind layout (mobile-first, 375px → desktop)

**Requirements:** AUTH-01, AUTH-02, AUTH-03, TASK-01, TASK-02, TASK-03, TASK-04, TASK-05, TASK-06, TASK-07, TASK-08, RT-01, RT-02

**Plans:** 5 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold project, install deps, DB migration, typed clients, shadcn init
- [x] 01-02-PLAN.md — Auth flow: login page, protected routes, session persistence
- [x] 01-03-PLAN.md — Task CRUD server functions and Zod validation schemas
- [x] 01-04-PLAN.md — Board UI: header, task list, status badges, realtime subscription
- [x] 01-05-PLAN.md — Task form (create/edit), delete dialog, CRUD wiring, visual checkpoint

**Status:** Complete (5/5 plans)

---

## Phase 2: PWA + Push Notifications

**Goal:** App feels native. Staff install it to their phone home screen and get push-alerted whenever a new task lands — closing the gap between the old KakaoTalk habit and the new tool.

**Deliverables:**
- vite-plugin-pwa configured (web app manifest, Workbox service worker)
- "Add to Home Screen" working on iOS Safari and Android Chrome
- Offline shell — app loads without network, graceful degradation for data
- VAPID key pair generated, stored as environment secrets
- Push subscription flow — staff grant permission, subscription stored in Supabase
- Supabase Database Webhook / Edge Function fires Web Push to all subscribers on task INSERT
- Push notification payload includes client name and request type

**Requirements:** NOTF-01, NOTF-02, NOTF-03, PWA-01, PWA-02, PWA-03

**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md — PWA foundation: vite-plugin-pwa, service worker, manifest, offline shell, install banner
- [x] 02-02-PLAN.md — Push subscription flow: permission card, subscription CRUD, UserMenu notifications indicator
- [ ] 02-03-PLAN.md — Push dispatch: Supabase Edge Function, VAPID keys, webhook setup, e2e verification

**Status:** 🔲 Not started

---

## Phase 3: AI Screenshot Processing

**Goal:** Eliminate manual re-keying. Staff upload a KakaoTalk screenshot and the form pre-fills. They review, correct if needed, and save. Targets the exact workflow that caused missed leads.

**Deliverables:**
- Screenshot upload UI — drag-and-drop on desktop, tap-to-upload on mobile
- TanStack Start `createServerFn` handler proxies image to Claude vision API
- Prompt engineered to extract: client name, phone, service, date/time, notes, request type from KakaoTalk screenshots (mixed Korean/English)
- Extracted fields pre-fill the task creation form
- Low-confidence fields visually highlighted for staff review
- Graceful fallback to manual entry for unreadable screenshots
- Basic rate limiting on the upload handler

**Requirements:** AI-01, AI-02, AI-03, AI-04, AI-05

**Status:** 🔲 Not started

---

## Phase 4: Filters, Search & Hardening

**Goal:** Production-stable quality pass. Filtering so the board stays usable as volume accumulates. Security audit. Cross-browser verification.

**Deliverables:**
- Filter bar: by status, request type, date range
- Search by client name or phone number
- Sort: newest first / oldest first
- Error boundaries and fallback UI for API failures
- Supabase RLS audit — confirm correct data access boundaries
- Cross-browser smoke test: iOS Safari, Android Chrome, macOS Chrome, Windows Chrome
- Lighthouse PWA + performance audit (target 90+ on mobile)
- Environment variable audit and secrets rotation checklist

**Requirements:** FILT-01, FILT-02, FILT-03, FILT-04 + full QA pass across all v1 requirements

**Status:** 🔲 Not started

---

## Summary

| Phase | Focus | Key Outcome | Status |
|-------|-------|-------------|--------|
| 1 — Foundation | Auth + CRUD + Realtime | Working shared task board | Done |
| 2 — PWA + Push | Native feel + notifications | Installed on phones, push alerts | 🔲 |
| 3 — AI OCR | Screenshot auto-fill | No manual re-keying | 🔲 |
| 4 — Polish | Filters + hardening | Production-stable | 🔲 |

---
*Roadmap created: 2026-03-31*
*Last updated: 2026-04-02 after Phase 2 planning*

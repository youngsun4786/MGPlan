# Technology Stack

**Analysis Date:** 2026-04-01
**Project Status:** Greenfield — planning phase. Nothing is implemented yet. All items are planned.

## Languages

**Primary:**
- TypeScript — entire application (client, server functions, config)

**Secondary:**
- SQL — Supabase schema, RLS policies, migrations
- CSS — via Tailwind CSS utility classes

## Runtime

**Environment:**
- Node.js — server-side rendering and `createServerFn` handlers via TanStack Start

**Package Manager:**
- Planned: npm or pnpm (not yet decided; project not scaffolded)
- Lockfile: not yet present

## Frameworks

**Core:**
- TanStack Start — full-stack React framework (Vite-based, file-based routing, type-safe server functions)
  - Chosen over Next.js by explicit user preference; Vite toolchain is faster and more familiar
  - `createServerFn` used for all server-side logic (Claude API proxy, push dispatch)
  - Vercel adapter planned for deployment

**Styling:**
- Tailwind CSS — utility-first CSS; mobile-first responsive layout (375px → 1024px+)

**PWA:**
- vite-plugin-pwa — web app manifest generation and Workbox service worker
- Workbox — offline shell caching strategy; app loads without network, graceful degradation for live data

**Testing:**
- Not yet decided — no test framework selected in planning documents

**Build/Dev:**
- Vite — bundler (included via TanStack Start)

## Key Dependencies

**Critical:**
- `@tanstack/start` — core framework; file-based routing, SSR, server functions
- `@supabase/supabase-js` — Supabase client for auth, database queries, realtime subscriptions
- `vite-plugin-pwa` — PWA manifest + Workbox service worker generation
- `tailwindcss` — styling

**Infrastructure:**
- Supabase JS client — used for auth session management, Postgres queries, and realtime channel subscriptions
- Web Push library (e.g., `web-push`) — planned for VAPID-signed push notification dispatch from server functions or Edge Functions

**AI:**
- Anthropic Claude API — accessed via `@anthropic-ai/sdk` or direct HTTP from a `createServerFn` handler; never called from the client

## Configuration

**Environment:**
- `.env` file expected at project root (not yet created)
- Required environment variables (planned):
  - `SUPABASE_URL` — Supabase project URL
  - `SUPABASE_ANON_KEY` — public anon key for client-side Supabase client
  - `SUPABASE_SERVICE_ROLE_KEY` — server-only key for admin operations (push dispatch Edge Function)
  - `ANTHROPIC_API_KEY` — Claude API key; server-side only, never exposed to client
  - `VAPID_PUBLIC_KEY` — public VAPID key sent to browser for push subscription
  - `VAPID_PRIVATE_KEY` — private VAPID key; server-side only
  - `VAPID_SUBJECT` — contact email or URL for VAPID identification

**Build:**
- `vite.config.ts` — Vite + TanStack Start + vite-plugin-pwa configuration
- `tailwind.config.ts` — Tailwind CSS configuration
- `tsconfig.json` — TypeScript configuration

## Platform Requirements

**Development:**
- Node.js (version TBD — project not yet scaffolded)
- Supabase CLI for local development and migrations (optional but recommended)

**Production:**
- Vercel — TanStack Start deployed via Vercel adapter (handles SSR + server functions as serverless functions)
- Supabase cloud — managed Postgres, Auth, Realtime, and optionally Edge Functions for push dispatch

## Rationale Summary

| Decision | Rationale |
|----------|-----------|
| TanStack Start over Next.js | User preference; Vite-based toolchain, file-based routing, type-safe `createServerFn` |
| Supabase (DB + Auth + Realtime) | Hosted Postgres with no server to manage; built-in realtime subscriptions and auth out of the box |
| Claude API for OCR | Best vision model for mixed Korean/English noisy KakaoTalk screenshots |
| Web Push + VAPID over OneSignal | No third-party lock-in; free; works on iOS 16.4+ PWA |
| PWA over native app | Avoids App Store overhead; covers mobile use case for a 3-5 person team |
| Vercel deployment | Natural fit for Vite/TanStack Start with serverless adapter |

---

*Stack analysis: 2026-04-01 — based on planning documents, pre-implementation*

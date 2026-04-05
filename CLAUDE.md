# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Production build (vite build + service worker)
npm run test         # Run all tests (vitest)
npx vitest run tests/server/tasks.test.ts  # Run a single test file
```

## Architecture

This is a **TanStack Start** (React + Vite) full-stack app with **Supabase** as the backend. It's a task management board for a massage salon ("Maison"), deployed on Vercel as a PWA.

### Stack

- **Framework**: TanStack Start (file-based routing via TanStack Router) with Nitro server
- **Styling**: Tailwind CSS v4 + shadcn/ui (base-nova style, `~/components/ui/`)
- **Validation**: Zod schemas in `app/lib/schemas.ts`, used both client-side and in server functions via `@tanstack/zod-adapter`
- **Database**: Supabase (Postgres), typed via `app/lib/database.types.ts`
- **Auth**: Supabase Auth with SSR cookie handling. Email allowlist restricts who can sign up.
- **PWA**: vite-plugin-pwa with injectManifest strategy, service worker at `app/sw.ts`

### Key Patterns

- **Server functions** live in `app/server/` and use `createServerFn` from TanStack Start. Each authenticates via `getSupabaseServerClient(request.headers)` and checks `supabase.auth.getUser()`.
- **Route auth guard**: `app/routes/_auth.tsx` is a layout route that redirects unauthenticated users to `/login`. All protected routes nest under `_auth/`.
- **Path alias**: `~/` maps to `app/` (configured in tsconfig + vite-tsconfig-paths).
- **Supabase clients**: Browser client in `app/lib/supabase.browser.ts` (uses `VITE_` prefixed env vars), server client in `app/lib/supabase.server.ts` (uses `process.env`).
- **Domain constants**: Task statuses and request types defined as const objects in `app/lib/constants.ts`.

### Environment Variables

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — client-side (exposed)
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — server-side

### Database Migrations

SQL migrations are in `supabase/migrations/`. Edge functions in `supabase/functions/`.

### Tests

Tests use Vitest with jsdom environment. Test files go in `tests/` mirroring the app structure. Setup file at `tests/setup.ts`.

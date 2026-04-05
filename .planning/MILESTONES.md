# Milestones

## v1.0 MVP (Shipped: 2026-04-05)

**Phases completed:** 4 phases, 14 plans, 32 tasks

**Key accomplishments:**

- TanStack Start scaffold with Supabase schema, typed clients, shadcn components, and vitest test infrastructure covering 35 requirement stubs
- Login page with SSR-safe auth guard, protected layout route with session expired redirect, and 8 structural auth tests replacing todo stubs
- Task board with realtime Supabase subscription, status badge cycling, staffMap cache for display_name resolution, and 10 passing component tests
- Task create/edit form dialog with react-hook-form + zodResolver validation, delete confirmation dialog, full CRUD wired into board page, and 38 total tests passing across the Phase 1 suite
- Installable PWA with Workbox service worker, offline shell/banner, and platform-specific install prompts (Android native + iOS instructions)
- Push subscription flow with VAPID keys, permission card UI, server-side storage in push_subscriptions table, and UserMenu notifications indicator
- Supabase Edge Function dispatching VAPID-signed Web Push notifications to all subscribed staff on task creation, with 410 Gone cleanup and Deno-native fallback documented
- Claude Vision extraction server function with parallel storage upload, rate limiting, typed extraction schemas, and client-side image utils
- Complete screenshot upload flow with dropdown menu, skeleton loading, confidence indicators, collapsible preview, and task row thumbnails with lightbox
- Pure applyFilters function with 21 TDD tests, useFilterState hook, and FilterBar component covering status/type/date/search filters with UTC boundary handling
- FilterBar and applyFilters wired end-to-end into board page with dual empty states and mobile scroll padding
- A11y polish with WCAG AA touch targets, aria attributes, toast error handling per D-09, and comprehensive hardening checklist with RLS audit (all PASS)

---

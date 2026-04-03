---
phase: 02-pwa-push-notifications
plan: 02
subsystem: pwa
tags: [web-push, vapid, push-api, push-subscription, supabase-rls]

requires:
  - phase: 02-pwa-push-notifications
    provides: "Service worker with push event handler, UserMenu with install option, InstallBanner, useInstallPrompt hook"
provides:
  - "push_subscriptions table with RLS policies (SELECT, INSERT, DELETE for own records)"
  - "Client-side push subscription helpers (subscribeToPush, getExistingSubscription, urlBase64ToUint8Array)"
  - "Server CRUD functions (savePushSubscription with upsert, deletePushSubscription)"
  - "usePushSubscription hook managing permission state and subscription lifecycle"
  - "PushPermissionCard inline UI component with Enable/Dismiss"
  - "UserMenu notifications off indicator with re-enable support"
  - "VAPID key generation and .env.example documentation"
affects: [02-03-PLAN]

tech-stack:
  added: [web-push]
  patterns: [localStorage-based dismissal state for push permission, VAPID key pair for Web Push, upsert on endpoint conflict]

key-files:
  created:
    - supabase/migrations/0002_push_subscriptions.sql
    - app/lib/push.ts
    - app/server/push.ts
    - app/hooks/usePushSubscription.ts
    - app/components/PushPermissionCard.tsx
  modified:
    - app/lib/database.types.ts
    - app/components/UserMenu.tsx
    - app/components/Header.tsx
    - app/routes/_auth/index.tsx
    - .env.example

key-decisions:
  - "VAPID keys generated in Plan 02 (moved from Plan 03) so subscription flow can be verified end-to-end"
  - "No webhook trigger in migration file to avoid secrets in git -- webhook configured via Supabase Dashboard in Plan 03"

patterns-established:
  - "localStorage key maison-push-dismissed for push permission card dismissal state"
  - "Server push functions follow same createServerFn pattern as tasks.ts with Zod validation"

requirements-completed: [NOTF-03]

duration: 4min
completed: 2026-04-03
---

# Phase 2 Plan 2: Push Subscription Summary

**Push subscription flow with VAPID keys, permission card UI, server-side storage in push_subscriptions table, and UserMenu notifications indicator**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-03T03:22:53Z
- **Completed:** 2026-04-03T03:27:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Created push_subscriptions table migration with RLS policies restricting staff to their own subscriptions, and database types updated
- Implemented full push subscription flow: client helpers (subscribeToPush, getExistingSubscription), server CRUD (savePushSubscription with upsert on endpoint, deletePushSubscription), and usePushSubscription hook managing permission/subscribe/dismiss lifecycle
- Built PushPermissionCard with inline card design, proper ARIA attributes (role=region, aria-label), and 44px touch targets
- Extended UserMenu with "Notifications off" indicator that re-triggers permission prompt if browser state is default, or shows "Enable in browser settings" if denied
- Wired PushPermissionCard into board page with correct priority order (push card, install banner, task list) and iOS standalone guard

## Task Commits

Each task was committed atomically:

1. **Task 1: Generate VAPID keys, create push_subscriptions migration, update database types, implement server functions and client push helpers** - `81a1f64` (feat)
2. **Task 2: Create usePushSubscription hook, PushPermissionCard component, extend UserMenu with notifications indicator, wire into board page** - `f1dd8cf` (feat)

## Files Created/Modified

- `supabase/migrations/0002_push_subscriptions.sql` - Push subscriptions table with 3 RLS policies
- `app/lib/database.types.ts` - Added push_subscriptions table type
- `app/lib/push.ts` - Client-side push subscription helpers (urlBase64ToUint8Array, subscribeToPush, getExistingSubscription)
- `app/server/push.ts` - Server functions for push subscription CRUD with Zod validation
- `.env.example` - Documented VAPID environment variables
- `app/hooks/usePushSubscription.ts` - Hook managing push permission state, subscribe/unsubscribe/dismiss
- `app/components/PushPermissionCard.tsx` - Inline dismissible permission card with Enable button
- `app/components/UserMenu.tsx` - Extended with pushState and onEnableNotifications props, "Notifications off" indicator
- `app/components/Header.tsx` - Pass-through for push notification props to UserMenu
- `app/routes/_auth/index.tsx` - Wired usePushSubscription, PushPermissionCard, iOS standalone guard

## Decisions Made

- VAPID keys generated in Plan 02 instead of Plan 03 so the subscription flow can be verified end-to-end without waiting for Edge Function setup
- No database webhook trigger in migration file to avoid committing secrets to git -- will be configured via Supabase Dashboard in Plan 03

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None -- all components are fully wired with real hooks, browser APIs, and server functions.

## User Setup Required

VAPID keys were generated during execution. The user needs to:
1. Add to `.env` file: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `VITE_VAPID_PUBLIC_KEY`
2. Later set these in Supabase Edge Function secrets and Vercel env vars (Plan 03)

## Next Phase Readiness

- Push subscription storage is ready for Plan 03 Edge Function to query push_subscriptions and fan out notifications
- VAPID keys are generated and documented -- Plan 03 needs them as Supabase Edge Function secrets
- Service worker push event handler (from Plan 01) is ready to receive notifications
- Database webhook on tasks INSERT needs to be configured via Supabase Dashboard (Plan 03)

---
*Phase: 02-pwa-push-notifications*
*Completed: 2026-04-03*

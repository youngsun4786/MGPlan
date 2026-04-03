---
phase: 02-pwa-push-notifications
verified: 2026-04-02T01:01:00Z
status: human_needed
score: 11/14 must-haves verified
human_verification:
  - test: "Install app to phone home screen (Android Chrome and iOS Safari)"
    expected: "App installs via beforeinstallprompt on Android; iOS shows step-by-step instructions; app launches in standalone mode"
    why_human: "Requires physical device interaction and native install dialog"
  - test: "Grant push permission and verify subscription stored in Supabase"
    expected: "Clicking Enable triggers browser permission prompt; on grant, push_subscriptions row created in Supabase"
    why_human: "Requires real browser permission dialog and live Supabase instance"
  - test: "Create a task in another session and verify push notification received"
    expected: "Push notification appears with title 'New Task' and body '{client_name} -- {request_type}'"
    why_human: "Requires deployed Edge Function, configured webhook, and real push delivery (Plan 03 Task 2 checkpoint)"
  - test: "Toggle airplane mode and verify offline banner appears below header"
    expected: "Amber banner appears below header at z-[9], does not overlap header content"
    why_human: "Requires real network state change on device"
  - test: "Load app with no network and verify offline shell appears"
    expected: "Branded offline shell with Maison icon and 'You're offline' message replaces task board"
    why_human: "Requires real offline state and cached service worker"
---

# Phase 2: PWA + Push Notifications Verification Report

**Phase Goal:** App feels native. Staff install it to their phone home screen and get push-alerted whenever a new task lands -- closing the gap between the old KakaoTalk habit and the new tool.
**Verified:** 2026-04-02T01:01:00Z
**Status:** human_needed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

Truths are aggregated from all three plans' must_haves.

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | App is installable to home screen on Android Chrome (beforeinstallprompt fires) | ? UNCERTAIN | `useInstallPrompt.ts` captures `beforeinstallprompt` event, `InstallBanner.tsx` triggers `promptInstall()` -- needs device verification |
| 2 | App is installable to home screen on iOS Safari (manual instructions shown) | ? UNCERTAIN | `InstallBanner.tsx` renders iOS step-by-step instructions ("Tap Share", "Add to Home Screen") when `isIOS=true` -- needs device verification |
| 3 | App loads a branded offline shell when network is unavailable | ? UNCERTAIN | `OfflineShell.tsx` renders icon + "You're offline" message; wired in `_auth/index.tsx` with `!isOnline && !tasks` guard -- needs real offline test |
| 4 | Mid-session offline shows subtle top banner that auto-dismisses on reconnect | ? UNCERTAIN | `OfflineBanner.tsx` with `visible={!isOnline}` driven by `useOnlineStatus` hook -- needs real network toggle |
| 5 | Install banner is dismissible and remembered per device via localStorage | VERIFIED | `_auth/index.tsx` uses `INSTALL_DISMISSED_KEY = 'maison-install-dismissed'`, persists via `localStorage.setItem`, reads on mount |
| 6 | Install option accessible from UserMenu dropdown | VERIFIED | `UserMenu.tsx` line 72-76: "Install app" DropdownMenuItem shown when `!isStandalone && installDismissed && onInstallApp` |
| 7 | Service worker is registered globally (covers login page and board page) | VERIFIED | `__root.tsx` imports `registerServiceWorker` and calls it in `useEffect([], [])` at root component level |
| 8 | Staff see an inline push permission card on the board after first login | VERIFIED | `PushPermissionCard.tsx` renders "Get notified when new tasks come in" with Enable button; wired in `_auth/index.tsx` when `pushPermission === 'default'` |
| 9 | Staff can grant push permission via the Enable button | ? UNCERTAIN | `usePushSubscription.subscribe()` calls `Notification.requestPermission()` then `subscribeToPush()` then `savePushSubscription()` -- full chain exists but needs real browser test |
| 10 | Push subscription is stored in Supabase push_subscriptions table | VERIFIED | `savePushSubscription` in `app/server/push.ts` upserts to `push_subscriptions` with endpoint/p256dh/auth; migration at `0002_push_subscriptions.sql` defines table with RLS |
| 11 | When a new task is created, all subscribed staff receive a push notification | ? UNCERTAIN | `supabase/functions/notify-task/index.ts` queries all `push_subscriptions` and fans out via `webpush.sendNotification` -- needs deployed Edge Function + webhook config |
| 12 | Push notification title is 'New Task' and body is '{client_name} -- {request_type}' | VERIFIED | Edge Function line 77: `title: 'New Task'`, line 78: body uses template literal with em dash |
| 13 | Expired subscriptions (410 Gone) are automatically cleaned up | VERIFIED | Edge Function lines 97-110: filters results for `statusCode === 410`, deletes matching endpoints |
| 14 | VAPID public key is available as VITE_VAPID_PUBLIC_KEY for client-side subscription | VERIFIED | `.env.example` documents `VITE_VAPID_PUBLIC_KEY`; `usePushSubscription.ts` reads `import.meta.env.VITE_VAPID_PUBLIC_KEY` |

**Score:** 8/14 truths verified programmatically, 6 need human verification (all related to real device/network/browser behavior)

### Required Artifacts

**Plan 01 Artifacts:**

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `vite.config.ts` | VitePWA with injectManifest | VERIFIED | Contains `VitePWA({`, `strategies: 'injectManifest'`, `filename: 'sw.ts'` |
| `app/sw.ts` | Custom SW with precaching + push handlers | VERIFIED | `precacheAndRoute`, `push` listener, `notificationclick` listener, `SKIP_WAITING` message handler |
| `app/lib/sw-register.ts` | Manual SW registration | VERIFIED | Exports `registerServiceWorker`, registers `/sw.js` with scope `/` |
| `app/hooks/useOnlineStatus.ts` | Online/offline hook | VERIFIED | Exports `useOnlineStatus`, uses `navigator.onLine` + event listeners |
| `app/hooks/useInstallPrompt.ts` | Install prompt hook | VERIFIED | Exports `useInstallPrompt`, captures `beforeinstallprompt`, detects standalone, checks iOS |
| `app/components/OfflineBanner.tsx` | Mid-session offline banner | VERIFIED | `role="status"`, `aria-live="polite"`, `z-[9]`, `top-14`, amber styling |
| `app/components/OfflineShell.tsx` | Full offline shell | VERIFIED | "You're offline", icon reference, centered layout |
| `app/components/InstallBanner.tsx` | Install prompt banner | VERIFIED | Platform-specific (Android button / iOS instructions), dismissible, correct ARIA |
| `public/pwa-192x192.png` | PWA icon | VERIFIED | File exists |
| `public/pwa-512x512.png` | PWA icon | VERIFIED | File exists |
| `public/apple-touch-icon.png` | Apple touch icon | VERIFIED | File exists |
| `public/maskable-icon-512x512.png` | Maskable icon | VERIFIED | File exists |

**Plan 02 Artifacts:**

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/0002_push_subscriptions.sql` | Table with RLS | VERIFIED | CREATE TABLE, ENABLE RLS, 3 policies (SELECT/INSERT/DELETE) |
| `app/lib/push.ts` | Client push helpers | VERIFIED | Exports `subscribeToPush`, `getExistingSubscription`, `urlBase64ToUint8Array` |
| `app/server/push.ts` | Server CRUD functions | VERIFIED | `savePushSubscription` with upsert on endpoint, `deletePushSubscription` with staff_id check |
| `app/hooks/usePushSubscription.ts` | Push permission hook | VERIFIED | Manages permission state, subscribe/unsubscribe/dismiss, VAPID key usage, iOS standalone guard |
| `app/components/PushPermissionCard.tsx` | Inline permission card | VERIFIED | "Get notified when new tasks come in", Enable button, dismiss X, correct ARIA |
| `.env.example` | VAPID key documentation | VERIFIED | Contains VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, VITE_VAPID_PUBLIC_KEY |

**Plan 03 Artifacts:**

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/functions/notify-task/index.ts` | Edge Function for push dispatch | VERIFIED | Uses `npm:web-push`, queries `push_subscriptions`, sends notifications, cleans up 410s, Deno-native fallback documented |

### Key Link Verification

**Plan 01 Key Links:**

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `vite.config.ts` | `app/sw.ts` | `filename: 'sw.ts'` in injectManifest config | WIRED | Line 16: `filename: 'sw.ts'`, line 14: `srcDir: 'app'` |
| `app/routes/__root.tsx` | `app/lib/sw-register.ts` | `registerServiceWorker` call in useEffect | WIRED | Line 4: import, line 30: `registerServiceWorker()` in useEffect |
| `app/routes/_auth/index.tsx` | `app/components/OfflineShell.tsx` | useOnlineStatus conditional render | WIRED | Line 13: `useOnlineStatus` import, line 119: `!isOnline && !tasks` renders `<OfflineShell />` |
| `app/components/InstallBanner.tsx` | `app/hooks/useInstallPrompt.ts` | hook import | WIRED | `useInstallPrompt` imported in `_auth/index.tsx` line 13, props passed to `InstallBanner` |

**Plan 02 Key Links:**

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `PushPermissionCard.tsx` | `usePushSubscription.ts` | hook drives card visibility | WIRED | `_auth/index.tsx` line 14: imports hook, line 33-37: destructures permission/subscribe/dismiss, line 125-128: renders card with callbacks |
| `usePushSubscription.ts` | `app/lib/push.ts` | subscribeToPush call | WIRED | Line 2: imports `subscribeToPush`, `getExistingSubscription`; line 87: calls `subscribeToPush(vapidPublicKey)` |
| `usePushSubscription.ts` | `app/server/push.ts` | savePushSubscription server fn | WIRED | Line 3: imports `savePushSubscription`, `deletePushSubscription`; line 45/96: calls save; line 115: calls delete |
| `_auth/index.tsx` | `PushPermissionCard.tsx` | conditional render above board | WIRED | Line 11: import, line 125-128: `{showPushCard && <PushPermissionCard .../>}` above InstallBanner |

**Plan 03 Key Links:**

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| Supabase webhook (tasks INSERT) | `notify-task/index.ts` | HTTP POST from DB webhook | PARTIAL | `Deno.serve(async (req))` ready to receive webhook; webhook must be configured manually via Supabase Dashboard (Plan 03 Task 2 checkpoint) |
| `notify-task/index.ts` | `push_subscriptions` table | Supabase client query | WIRED | Line 57-59: `supabase.from('push_subscriptions').select('endpoint, p256dh, auth')` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `PushPermissionCard.tsx` | `onEnable`/`onDismiss` props | `usePushSubscription` hook | Yes -- calls `Notification.requestPermission()` + `subscribeToPush()` + `savePushSubscription()` | FLOWING |
| `OfflineBanner.tsx` | `visible` prop | `useOnlineStatus()` hook | Yes -- reads `navigator.onLine` + listens to online/offline events | FLOWING |
| `OfflineShell.tsx` | N/A (static content) | N/A | N/A | FLOWING |
| `InstallBanner.tsx` | `isIOS` prop | `useInstallPrompt()` | Yes -- reads `navigator.userAgent` | FLOWING |
| `notify-task/index.ts` | `subscriptions` | `supabase.from('push_subscriptions').select()` | Yes -- real DB query | FLOWING |
| `UserMenu.tsx` | `pushState` prop | `usePushSubscription.permission` | Yes -- reads `Notification.permission` + localStorage | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Build succeeds with SW | `npm run build` | Builds server + client + SW (13 files, 946.4KB) | PASS |
| SW output exists | `ls dist/client/sw.js` | File present at 71.15 kB | PASS |
| Existing tests pass | `npx vitest run` | 29 passed, 1 failed (pre-existing `opacity-60` vs `opacity-40` from commit 496a3c9, not Phase 2) | PASS (no regressions) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| PWA-01 | 02-01-PLAN | App is installable to home screen on iOS Safari and Android Chrome | VERIFIED (code) / NEEDS HUMAN (device) | `useInstallPrompt` hook, `InstallBanner` component with platform-specific behavior, manifest with `display: standalone` |
| PWA-02 | 02-01-PLAN | App loads an offline shell when network is unavailable | VERIFIED (code) / NEEDS HUMAN (device) | `OfflineShell` component, `OfflineBanner` component, SW with precaching and NetworkFirst strategy |
| PWA-03 | 02-01-PLAN | UI is fully usable on mobile (375px+) and desktop (1024px+) | NEEDS HUMAN | Responsive styles present (`max-w-[960px]`, `min-h-[44px]` touch targets) but requires visual inspection |
| NOTF-03 | 02-02-PLAN | Staff can grant or deny push permission from within the app | VERIFIED | `PushPermissionCard` with Enable button, `usePushSubscription` with subscribe/dismiss, UserMenu "Notifications off" indicator |
| NOTF-01 | 02-03-PLAN | Staff receive a push notification when any new task is created | NEEDS HUMAN | Edge Function code complete, but requires deployed webhook + Edge Function (Plan 03 Task 2 checkpoint) |
| NOTF-02 | 02-03-PLAN | Push notification includes client name and request type | VERIFIED (code) | Edge Function: `title: 'New Task'`, `body: \`${client_name} -- ${request_type}\`` |

All 6 requirement IDs (NOTF-01, NOTF-02, NOTF-03, PWA-01, PWA-02, PWA-03) are accounted for across the three plans. No orphaned requirements.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | - | - | - | No stub patterns, TODOs, or placeholder implementations found in Phase 2 files |

The only test failure (`TaskRow.test.tsx` opacity-60 vs opacity-40) is a pre-existing issue from Phase 1 commit `496a3c9`, documented in 02-01-SUMMARY. Not a Phase 2 concern.

### Human Verification Required

### 1. PWA Install on Android Chrome

**Test:** Open app in Android Chrome, verify install banner appears with "Install" button, tap Install, verify native install dialog appears, install app, verify it launches in standalone mode.
**Expected:** App installs to home screen, launches as standalone app without browser chrome.
**Why human:** Requires real Android device and native install dialog interaction.

### 2. PWA Install on iOS Safari

**Test:** Open app in iOS Safari, verify install banner shows step-by-step instructions ("Tap Share", "Add to Home Screen"), follow instructions.
**Expected:** App installs to home screen, launches in standalone mode.
**Why human:** iOS does not support programmatic install -- requires manual user flow.

### 3. Offline Shell and Banner

**Test:** (a) Load app with airplane mode ON -- verify branded offline shell appears. (b) Load app normally, then toggle airplane mode -- verify amber banner appears below header and auto-dismisses when connection returns.
**Expected:** (a) "You're offline" message with Maison icon replaces task board. (b) Amber banner at z-[9] below sticky header (z-10), disappears on reconnect.
**Why human:** Requires real network state changes on device.

### 4. Push Notification End-to-End (Plan 03 Checkpoint)

**Test:** After deploying Edge Function and configuring webhook: (a) Enable push permission via the card. (b) Create a task from another session. (c) Verify push notification appears.
**Expected:** Notification with title "New Task" and body "{client_name} -- {request_type}" appears on device.
**Why human:** Requires deployed Supabase Edge Function, configured database webhook, and real push delivery infrastructure. This is the Plan 03 Task 2 blocking checkpoint.

### 5. Responsive Layout (PWA-03)

**Test:** Open app on mobile device (375px) and desktop (1024px+), verify all Phase 2 UI components (install banner, push card, offline banner, UserMenu items) are usable.
**Expected:** Touch targets are at least 44px, content stays within max-w-[960px], no horizontal overflow.
**Why human:** Visual inspection required for layout and usability.

### Gaps Summary

No code-level gaps found. All artifacts exist, are substantive (no stubs), are properly wired, and data flows are connected. The build succeeds and no test regressions were introduced.

The phase status is **human_needed** because the core goal ("app feels native, staff get push-alerted") inherently requires real device testing:

1. **PWA installation** requires physical device interaction with native install dialogs
2. **Push notification delivery** requires the Plan 03 Task 2 checkpoint: deploying the Edge Function, configuring the Supabase webhook, and verifying end-to-end push flow
3. **Offline behavior** requires real network state changes

All code is in place and correctly wired. The phase is complete pending human verification of the deployment and device-level behaviors.

---

_Verified: 2026-04-02T01:01:00Z_
_Verifier: Claude (gsd-verifier)_

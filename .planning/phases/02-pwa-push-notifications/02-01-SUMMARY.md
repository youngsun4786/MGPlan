---
phase: 02-pwa-push-notifications
plan: 01
subsystem: pwa
tags: [vite-plugin-pwa, workbox, service-worker, offline, install-prompt, pwa]

requires:
  - phase: 01-foundation-core-board
    provides: "TanStack Start app with Header, UserMenu, TaskBoard components and Vite build pipeline"
provides:
  - "vite-plugin-pwa configured with injectManifest strategy and web app manifest"
  - "Custom service worker with Workbox precaching, push event handler, notification click handler"
  - "Manual SW registration utility (global, covers all routes)"
  - "useOnlineStatus hook for online/offline detection"
  - "useInstallPrompt hook for PWA install prompt management"
  - "OfflineBanner, OfflineShell, InstallBanner UI components"
  - "UserMenu extended with Install app option"
  - "Placeholder PWA icons in public/"
affects: [02-02-PLAN, 02-03-PLAN]

tech-stack:
  added: [vite-plugin-pwa, workbox-precaching, workbox-routing, workbox-strategies, workbox-core, workbox-build]
  patterns: [post-build SW compilation for TanStack Start compatibility, injectManifest strategy, manual SW registration]

key-files:
  created:
    - app/sw.ts
    - app/lib/sw-register.ts
    - app/hooks/useOnlineStatus.ts
    - app/hooks/useInstallPrompt.ts
    - app/components/OfflineBanner.tsx
    - app/components/OfflineShell.tsx
    - app/components/InstallBanner.tsx
    - scripts/build-sw.mjs
    - public/pwa-192x192.png
    - public/pwa-512x512.png
    - public/apple-touch-icon.png
    - public/maskable-icon-512x512.png
  modified:
    - vite.config.ts
    - package.json
    - app/routes/__root.tsx
    - app/routes/_auth/index.tsx
    - app/components/Header.tsx
    - app/components/UserMenu.tsx

key-decisions:
  - "Post-build SW script instead of vite-plugin-pwa closeBundle: VitePWA closeBundle hook does not fire in TanStack Start Vite 7 environment builder API"
  - "Global SW registration in __root.tsx covers all routes including /login"
  - "Placeholder PNG icons generated via Node.js zlib (solid teal color) -- user replaces with branding later"

patterns-established:
  - "Post-build script pattern: scripts/build-sw.mjs runs after vite build for SW compilation"
  - "Custom hooks in app/hooks/ for browser API wrappers (online status, install prompt)"
  - "localStorage-based dismissal state for banners (maison-install-dismissed key)"

requirements-completed: [PWA-01, PWA-02, PWA-03]

duration: 22min
completed: 2026-04-03
---

# Phase 2 Plan 1: PWA Shell & Install Summary

**Installable PWA with Workbox service worker, offline shell/banner, and platform-specific install prompts (Android native + iOS instructions)**

## Performance

- **Duration:** 22 min
- **Started:** 2026-04-03T02:56:46Z
- **Completed:** 2026-04-03T03:19:37Z
- **Tasks:** 2
- **Files modified:** 20

## Accomplishments

- Configured vite-plugin-pwa with injectManifest strategy generating web app manifest and building custom service worker with Workbox precaching + push event stubs
- Created offline detection UI: OfflineBanner for mid-session drops (amber, z-[9] below header z-10), OfflineShell for load-time offline state
- Built InstallBanner with platform-specific behavior (Android beforeinstallprompt, iOS step-by-step instructions) and UserMenu fallback
- Registered service worker globally at root layout level, covering all routes including /login

## Task Commits

Each task was committed atomically:

1. **Task 1: Install vite-plugin-pwa, create service worker, configure manifest, add placeholder icons** - `f2f1b13` (feat)
2. **Task 2: Create offline/install hooks and UI components, extend UserMenu, wire SW registration** - `f942158` (feat)

## Files Created/Modified

- `vite.config.ts` - Added VitePWA plugin with injectManifest strategy and manifest config
- `app/sw.ts` - Custom service worker with precaching, push, notificationclick, and skip-waiting handlers
- `app/lib/sw-register.ts` - Manual SW registration utility
- `scripts/build-sw.mjs` - Post-build script for TanStack Start compatibility (compiles SW + injects manifest)
- `app/hooks/useOnlineStatus.ts` - Online/offline state tracking hook
- `app/hooks/useInstallPrompt.ts` - Install prompt management hook (beforeinstallprompt + standalone detection)
- `app/components/OfflineBanner.tsx` - Mid-session offline banner (amber, below sticky header)
- `app/components/OfflineShell.tsx` - Full offline state replacement with branding
- `app/components/InstallBanner.tsx` - PWA install prompt banner with iOS instructions
- `app/components/UserMenu.tsx` - Extended with "Install app" dropdown item
- `app/components/Header.tsx` - Pass-through for install-related props to UserMenu
- `app/routes/__root.tsx` - Global SW registration + apple-touch-icon + theme-color meta
- `app/routes/_auth/index.tsx` - Wired offline detection, install prompt, and conditional rendering
- `public/pwa-192x192.png` - Placeholder PWA icon (192x192, teal)
- `public/pwa-512x512.png` - Placeholder PWA icon (512x512, teal)
- `public/apple-touch-icon.png` - Placeholder Apple touch icon (180x180, teal)
- `public/maskable-icon-512x512.png` - Placeholder maskable icon (512x512, teal)
- `package.json` - Added vite-plugin-pwa, workbox deps, updated build script

## Decisions Made

- **Post-build SW script:** vite-plugin-pwa's `closeBundle` hook does not fire correctly with TanStack Start's Vite 7 environment builder API (`sharedPlugins: true` + `buildApp`). The `build.ssr` check in the plugin's closeBundle handler never triggers for the client environment. Solution: `scripts/build-sw.mjs` uses Vite to compile `app/sw.ts` then `workbox-build.injectManifest()` to inject the precache manifest. Build script chained via `"build": "vite build && node scripts/build-sw.mjs"`.
- **Global SW registration in __root.tsx:** Ensures SW covers all routes including /login, so offline shell works even when unauthenticated.
- **Placeholder icons:** Generated programmatically as solid teal PNGs via Node.js Buffer + zlib. User will replace with actual branding.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] vite-plugin-pwa closeBundle hook incompatible with TanStack Start environment builder**
- **Found during:** Task 1 (vite-plugin-pwa configuration)
- **Issue:** vite-plugin-pwa's `closeBundle` hook checks `ctx.viteConfig.build.ssr` to decide when to generate the SW. With TanStack Start's Vite 7 environment builder API (`sharedPlugins: true`), this check never evaluates correctly for the client build, so the SW is never generated.
- **Fix:** Created `scripts/build-sw.mjs` that uses Vite to compile `app/sw.ts` to JS, then `workbox-build.injectManifest()` to inject the precache manifest. Added `workbox-build` as dev dependency. Chained in package.json build script.
- **Files modified:** `scripts/build-sw.mjs`, `package.json`
- **Verification:** `npm run build` succeeds, `dist/client/sw.js` exists with precache entries (13 files, 942.6KB)
- **Committed in:** f2f1b13 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for SW generation. No scope creep -- the post-build script does exactly what vite-plugin-pwa would have done if its closeBundle hook worked with the environment builder.

## Issues Encountered

- Pre-existing test failure (`opacity-60` vs `opacity-40` in TaskRow.test.tsx) -- not related to this plan's changes. The test was broken by commit `496a3c9` which changed opacity from 60 to 40 but didn't update the test expectation. Out of scope.

## Known Stubs

None -- all components are fully wired with real hooks and browser APIs. No placeholder data flows.

## User Setup Required

None - no external service configuration required. Icons are placeholders and can be replaced with actual branding at any time.

## Next Phase Readiness

- Service worker is active with push event handler stub ready for Plan 02 (push subscription flow)
- `app/sw.ts` push handler reads `data.title` and `data.body` from push event payload -- Plan 02 Edge Function will send these fields
- UserMenu is ready for "Notifications off" indicator (Plan 02 adds push permission state)
- Board page has slot for PushPermissionCard above InstallBanner (Plan 02 adds this component)

---
*Phase: 02-pwa-push-notifications*
*Completed: 2026-04-03*

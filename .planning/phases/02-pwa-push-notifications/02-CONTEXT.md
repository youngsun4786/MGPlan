# Phase 2: PWA + Push Notifications - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the app feel native. Staff install it to their phone home screen and get push-alerted whenever a new task lands — closing the gap between the old KakaoTalk habit and the new tool.

Deliverables:
- vite-plugin-pwa configured (web app manifest, Workbox service worker)
- "Add to Home Screen" working on iOS Safari and Android Chrome
- Offline shell — app loads without network, graceful degradation for data
- VAPID key pair generated, stored as environment secrets
- Push subscription flow — staff grant permission, subscription stored in Supabase
- Supabase Database Webhook / Edge Function fires Web Push to all subscribers on task INSERT
- Push notification payload includes client name and request type

This phase does NOT include: AI screenshot processing, filtering/search, task assignment, or analytics.

</domain>

<decisions>
## Implementation Decisions

### Push Permission Flow
- **D-01:** Prompt for push permission **after first login** — show a dismissible inline card at the top of the task board: "Get notified when new tasks come in" + Enable button.
- **D-02:** If staff dismiss or deny the permission prompt, show a **quiet "Notifications off" indicator in the UserMenu dropdown**. No nagging banners or repeat prompts.
- **D-03:** The pre-permission card is an **inline card on the board** (matching the minimal card style from Phase 1). Not a modal or toast.
- **D-04:** **No distinction between dismissed vs denied** — treat both the same. If permission was blocked at browser level, the enable button in UserMenu explains how to unblock in browser settings.

### Offline Behavior
- **D-05:** When the app loads offline, show a **branded shell + offline message**: app shell loads (header, layout) with a centered message: "You're offline — connect to see tasks." No cached task list, no stale-data risk.
- **D-06:** When connection drops mid-session, show a **subtle top banner**: "Offline — changes won't sync until reconnected." Disappears automatically when connection returns.

### Install Prompt UX
- **D-07:** Show an **in-app install banner** on the task board: "Install Maison for quick access" + Install button. On Android, triggers native install dialog via `beforeinstallprompt`. On iOS, shows step-by-step instructions (Share → Add to Home Screen).
- **D-08:** Install banner is **dismissible, shown once per device**. If dismissed or if the app detects standalone mode (`display-mode: standalone`), hide forever. Re-accessible from UserMenu if needed.

### Push Notification Content
- **D-09:** Push notification shows **client name + request type**. Title: "New Task" / Body: "{client name} — {request type}". Matches NOTF-02 requirement.
- **D-10:** Tapping the notification **opens the task board** (main page). No deep-linking to specific task. The FIFO list ensures the new task is visible.
- **D-11:** **All staff get notified** including the task creator. No sender exclusion filtering. Serves as confirmation that the task was saved.
- **D-12:** Notifications use **default OS sound/vibration**. No custom sound. Staff control notification sounds via their phone's notification settings.

### Claude's Discretion
- Service worker caching strategy details (Workbox config, precache vs runtime cache split)
- Web app manifest icon sizes and splash screen configuration
- Push subscription table schema in Supabase (columns, indexes)
- VAPID key generation tooling and storage approach
- Edge Function vs createServerFn for push dispatch — whichever fits the stack better
- Exact banner/card component styling (colors, spacing) — follow existing conventions

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Project vision, constraints, tech stack decisions (Web Push + VAPID chosen over OneSignal)
- `.planning/REQUIREMENTS.md` — Phase 2 req IDs: NOTF-01, NOTF-02, NOTF-03, PWA-01, PWA-02, PWA-03
- `.planning/STATE.md` — Current progress and tech stack decisions

### Prior Phase Context
- `.planning/phases/01-foundation-core-board/01-CONTEXT.md` — Phase 1 design decisions (board layout, auth UX, database schema patterns)

### Conventions & Stack
- `.planning/codebase/CONVENTIONS.md` — Naming patterns, TanStack Start patterns, Supabase patterns, Tailwind patterns
- `.planning/codebase/STACK.md` — vite-plugin-pwa, Workbox, Web Push + VAPID planned dependencies, VAPID env vars
- `.planning/codebase/INTEGRATIONS.md` — Supabase integration points
- `.planning/codebase/ARCHITECTURE.md` — File structure

### Roadmap
- `.planning/ROADMAP.md` — Phase 2 deliverables and requirement mapping

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/components/Header.tsx` — Top header component; install banner and offline banner can integrate here or below it
- `app/components/UserMenu.tsx` — User dropdown menu; "Notifications off" indicator and "Install app" option go here
- `app/components/TaskBoard.tsx` — Main board component; push permission card renders at top of this
- `app/lib/supabase.browser.ts` — Browser Supabase client; push subscription storage uses this
- `app/lib/supabase.server.ts` — Server Supabase client; push dispatch Edge Function/server fn uses this
- `app/server/tasks.ts` — Server functions for task CRUD; push notification trigger hooks into task creation here

### Established Patterns
- Supabase Auth session management via `getUser()` in route loaders
- Real-time via `supabase.channel('tasks:all').on('postgres_changes', ...)` — push dispatch is a separate server-side concern, not a client channel
- Tailwind CSS utility classes with `cn()` helper for conditional styling
- TanStack Start file-based routing in `app/routes/`

### Integration Points
- `vite.config.ts` — Add vite-plugin-pwa configuration here
- `app/routes/_auth.tsx` — Protected layout route; offline detection and banners integrate at this level
- Push subscription flow: browser → `createServerFn` → Supabase `push_subscriptions` table
- Push dispatch: Supabase DB webhook on task INSERT → Edge Function → Web Push API to all subscribers

</code_context>

<specifics>
## Specific Ideas

- The push permission card and install banner are both inline cards on the board — they should share a similar dismissible card style. Show push permission card first (more important), then install banner below it if applicable.
- iOS Safari requires a user gesture to trigger the permission prompt — the Enable button on the card satisfies this requirement.
- Staff are 3-5 people on a flat team — no need for per-user notification preferences beyond on/off. Keep it simple.
- The offline shell approach means no IndexedDB caching complexity — service worker only caches the app shell (HTML, CSS, JS), not API data.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 2 scope.

</deferred>

---

*Phase: 02-pwa-push-notifications*
*Context gathered: 2026-04-02*

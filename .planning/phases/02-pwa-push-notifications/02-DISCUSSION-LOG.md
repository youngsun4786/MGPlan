# Phase 2: PWA + Push Notifications - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-02
**Phase:** 02-pwa-push-notifications
**Areas discussed:** Push permission flow, Offline behavior, Install prompt UX, Push notification content

---

## Push Permission Flow

### When to ask for permission

| Option | Description | Selected |
|--------|-------------|----------|
| After first login | Show explanation + Enable button on board after first sign-in. One-time prompt. | ✓ |
| On first task creation | Delay ask until staff creates first task — higher opt-in but delays coverage. | |
| Manual from menu only | Never proactively prompt. Staff enable from UserMenu. | |

**User's choice:** After first login (Recommended)
**Notes:** None

### Handling denied/dismissed permission

| Option | Description | Selected |
|--------|-------------|----------|
| Quiet reminder in menu | Small 'Notifications off' indicator in UserMenu dropdown. No nagging. | ✓ |
| Periodic gentle nudge | Dismissible banner once per week reminding notifications are off. | |
| No reminder at all | Respect the decision completely. No visual indicator. | |

**User's choice:** Quiet reminder in menu (Recommended)
**Notes:** None

### Pre-permission explanation style

| Option | Description | Selected |
|--------|-------------|----------|
| Inline card on board | Dismissible card at top of board: 'Get notified when new tasks come in' + Enable. | ✓ |
| Modal dialog | Centered modal overlay with Enable/Later buttons. | |
| Toast/banner | Slim banner at top or bottom of screen. | |

**User's choice:** Inline card on board (Recommended)
**Notes:** None

### Dismissed vs denied distinction

| Option | Description | Selected |
|--------|-------------|----------|
| No distinction | Treat both the same. Enable button in menu explains how to unblock if needed. | ✓ |
| Distinguish them | Track separately. Re-show prompt for dismissed users on next login. | |

**User's choice:** No distinction (Recommended)
**Notes:** None

---

## Offline Behavior

### What shows when app loads offline

| Option | Description | Selected |
|--------|-------------|----------|
| Branded shell + offline message | App shell loads with centered message: 'You're offline — connect to see tasks.' | ✓ |
| Cached read-only task list | Cache last-seen task list. Staff can browse but not create/edit. | |
| Full offline with queue | Cache tasks AND allow offline creation with sync. Complex conflict resolution. | |

**User's choice:** Branded shell + offline message (Recommended)
**Notes:** None

### Mid-session connection drop indicator

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle top banner | Slim colored banner: 'Offline — changes won't sync until reconnected.' Auto-disappears. | ✓ |
| Toast notification | Temporary toast popup for offline/online transitions. | |
| No indicator | Fail silently — actions won't work until reconnected. | |

**User's choice:** Subtle top banner (Recommended)
**Notes:** None

---

## Install Prompt UX

### How to encourage home screen install

| Option | Description | Selected |
|--------|-------------|----------|
| In-app install banner | Dismissible card on board: 'Install Maison for quick access' + Install button. | ✓ |
| Rely on browser native UI | No custom prompts. Android shows its own bar; iOS users discover themselves. | |
| First-login onboarding modal | Modal walks staff through installation before reaching board. | |

**User's choice:** In-app install banner (Recommended)
**Notes:** User asked for detailed explanation of how PWA install works in a web app. Explained the full flow: manifest.json + service worker → browser detects installability → custom banner triggers native install (Android) or shows manual instructions (iOS). No app store involved.

### Banner persistence

| Option | Description | Selected |
|--------|-------------|----------|
| Dismissible, show once | Show once per device. Hidden if dismissed or standalone mode detected. Re-accessible from menu. | ✓ |
| Dismissible, re-show weekly | Re-appear once a week until installed. | |
| Persistent until installed | Always visible until detected as installed. | |

**User's choice:** Dismissible, show once (Recommended)
**Notes:** None

---

## Push Notification Content

### What the notification shows

| Option | Description | Selected |
|--------|-------------|----------|
| Client name + request type | Title: 'New Task' / Body: 'Jane Kim — New Booking'. Matches NOTF-02. | ✓ |
| Client name + request type + service | More detail: includes service requested. Longer text. | |
| Minimal — just 'New task' | Privacy-first, no client details on lock screen. | |

**User's choice:** Client name + request type (Recommended)
**Notes:** None

### Tap action

| Option | Description | Selected |
|--------|-------------|----------|
| Open the task board | Opens app to main board. FIFO list ensures new task is visible. | ✓ |
| Open the specific task | Opens directly to new task detail/edit view. Requires deep linking. | |

**User's choice:** Open the task board (Recommended)
**Notes:** None

### Self-notification (creator receives own notification?)

| Option | Description | Selected |
|--------|-------------|----------|
| Exclude sender | Creator does NOT receive notification. Only other staff notified. | |
| Notify everyone | All staff notified including creator. Serves as save confirmation. | ✓ |

**User's choice:** Notify everyone
**Notes:** User preferred simpler implementation — no sender filtering needed.

### Sound/vibration

| Option | Description | Selected |
|--------|-------------|----------|
| Default OS sound | Use device's default notification sound/vibration. Staff control via phone settings. | ✓ |
| Silent — visual only | No sound or vibration. Appears silently in notification tray. | |

**User's choice:** Default OS sound (Recommended)
**Notes:** None

---

## Claude's Discretion

- Service worker caching strategy details (Workbox config)
- Web app manifest icon sizes and splash screen configuration
- Push subscription table schema in Supabase
- VAPID key generation tooling and storage approach
- Edge Function vs createServerFn for push dispatch
- Exact banner/card component styling

## Deferred Ideas

None — discussion stayed within phase scope.

# Phase 2: PWA + Push Notifications - Research

**Researched:** 2026-04-02
**Domain:** Progressive Web App (service worker, manifest, offline), Web Push (VAPID, Push API), Supabase Edge Functions
**Confidence:** HIGH

## Summary

Phase 2 transforms the existing TanStack Start task board into an installable PWA with push notification support. The core technical challenges are: (1) configuring `vite-plugin-pwa` with `injectManifest` strategy to support both offline shell caching and custom push event handling, (2) implementing the Web Push subscription flow with VAPID keys and storing subscriptions in Supabase, and (3) creating a Supabase Edge Function triggered by a database webhook on `tasks` INSERT to fan out push notifications via the Web Push protocol.

iOS Safari has specific constraints: push notifications only work in standalone (home screen installed) PWA mode on iOS 16.4+, the permission prompt must be triggered by a user gesture, and the EU has removed PWA standalone support. The 3-5 person team size means fan-out is trivial (no batching needed), and the simple "all staff get notified" model avoids complex targeting logic.

**Primary recommendation:** Use `vite-plugin-pwa` v1.2.0 with `injectManifest` strategy (required for custom push event listener in the service worker), the `web-push` npm package v3.6.7 imported via `npm:web-push` in the Supabase Edge Function, and a database webhook on the `tasks` table INSERT event to trigger notification dispatch.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Prompt for push permission after first login -- show a dismissible inline card at the top of the task board: "Get notified when new tasks come in" + Enable button.
- **D-02:** If staff dismiss or deny the permission prompt, show a quiet "Notifications off" indicator in the UserMenu dropdown. No nagging banners or repeat prompts.
- **D-03:** The pre-permission card is an inline card on the board (matching the minimal card style from Phase 1). Not a modal or toast.
- **D-04:** No distinction between dismissed vs denied -- treat both the same. If permission was blocked at browser level, the enable button in UserMenu explains how to unblock in browser settings.
- **D-05:** When the app loads offline, show a branded shell + offline message: app shell loads (header, layout) with a centered message: "You're offline -- connect to see tasks." No cached task list, no stale-data risk.
- **D-06:** When connection drops mid-session, show a subtle top banner: "Offline -- changes won't sync until reconnected." Disappears automatically when connection returns.
- **D-07:** Show an in-app install banner on the task board: "Install Maison for quick access" + Install button. On Android, triggers native install dialog via `beforeinstallprompt`. On iOS, shows step-by-step instructions (Share -> Add to Home Screen).
- **D-08:** Install banner is dismissible, shown once per device. If dismissed or if the app detects standalone mode (`display-mode: standalone`), hide forever. Re-accessible from UserMenu if needed.
- **D-09:** Push notification shows client name + request type. Title: "New Task" / Body: "{client name} -- {request type}". Matches NOTF-02 requirement.
- **D-10:** Tapping the notification opens the task board (main page). No deep-linking to specific task.
- **D-11:** All staff get notified including the task creator. No sender exclusion filtering.
- **D-12:** Notifications use default OS sound/vibration. No custom sound.

### Claude's Discretion
- Service worker caching strategy details (Workbox config, precache vs runtime cache split)
- Web app manifest icon sizes and splash screen configuration
- Push subscription table schema in Supabase (columns, indexes)
- VAPID key generation tooling and storage approach
- Edge Function vs createServerFn for push dispatch -- whichever fits the stack better
- Exact banner/card component styling (colors, spacing) -- follow existing conventions

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within Phase 2 scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NOTF-01 | Staff receive a push notification when any new task is created | Supabase DB webhook on `tasks` INSERT triggers Edge Function that sends Web Push to all subscribers |
| NOTF-02 | Push notification includes client name and request type | Edge Function reads `record.client_name` and `record.request_type` from webhook payload, formats into push message |
| NOTF-03 | Staff can grant or deny push permission from within the app | Browser Push API `Notification.requestPermission()` triggered from inline card (D-01), state managed in UserMenu (D-02) |
| PWA-01 | App is installable to home screen on iOS Safari and Android Chrome | vite-plugin-pwa generates manifest with `display: standalone`; `beforeinstallprompt` for Android; manual instructions for iOS |
| PWA-02 | App loads an offline shell when network is unavailable | Service worker precaches app shell (HTML, CSS, JS); offline page shows branded message (D-05) |
| PWA-03 | UI is fully usable on mobile (375px+) and desktop (1024px+) | Already addressed in Phase 1 responsive layout; Phase 2 adds PWA viewport meta and safe-area handling |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite-plugin-pwa | 1.2.0 | PWA manifest generation + Workbox service worker build | De facto standard for Vite-based PWAs; handles manifest, icons, SW build pipeline |
| web-push | 3.6.7 | VAPID-signed Web Push message dispatch (server-side) | Standard Node.js library for Web Push protocol; used in Supabase Edge Function via `npm:web-push` |
| workbox-precaching | 7.x | Precache app shell assets in service worker | Part of Workbox; vite-plugin-pwa uses it internally for injectManifest |
| workbox-routing | 7.x | Route matching in service worker | Needed for NavigationRoute to offline fallback |
| workbox-strategies | 7.x | Cache strategies (NetworkFirst, CacheFirst) | Runtime caching for assets |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @negrel/webpush (JSR) | latest | Deno-native Web Push alternative | Fallback if `npm:web-push` has issues in Supabase Edge Functions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `injectManifest` | `generateSW` | generateSW is simpler but cannot handle custom push event listeners -- injectManifest is required for push |
| `web-push` (npm) | `@negrel/webpush` (JSR) | JSR package is Deno-native but less battle-tested; npm:web-push benefits from Node compat layer |
| Supabase Edge Function | TanStack Start `createServerFn` | Edge Function is better: triggered by DB webhook (no client roundtrip), runs independently of app server |
| OneSignal | Web Push + VAPID | Locked decision: no third-party lock-in, free, sufficient for 3-5 users |

**Installation (app):**
```bash
npm install vite-plugin-pwa
npm install -D workbox-precaching workbox-routing workbox-strategies workbox-core
```

**VAPID key generation:**
```bash
npx web-push generate-vapid-keys
```
Store public key in `VAPID_PUBLIC_KEY`, private key in `VAPID_PRIVATE_KEY`, and contact email in `VAPID_SUBJECT` as environment variables (Vercel + Supabase secrets).

## Architecture Patterns

### Recommended Project Structure
```
app/
├── components/
│   ├── InstallBanner.tsx        # PWA install prompt (D-07, D-08)
│   ├── OfflineBanner.tsx        # Mid-session offline banner (D-06)
│   ├── PushPermissionCard.tsx   # Push permission inline card (D-01, D-03)
│   └── UserMenu.tsx             # Extended with notifications toggle + install option
├── hooks/
│   ├── useInstallPrompt.ts      # beforeinstallprompt event + standalone detection
│   ├── useOnlineStatus.ts       # navigator.onLine + online/offline events
│   └── usePushSubscription.ts   # Push permission state + subscription management
├── server/
│   └── push.ts                  # createServerFn to store/delete push subscriptions
├── lib/
│   └── push.ts                  # Client-side push subscription helpers (subscribe, urlBase64ToUint8Array)
├── routes/
│   └── _auth.tsx                # Add offline detection wrapper here
└── sw.ts                        # Custom service worker (injectManifest source)
supabase/
├── functions/
│   └── notify-task/
│       └── index.ts             # Edge Function: Web Push dispatch
└── migrations/
    └── 0002_push_subscriptions.sql  # push_subscriptions table + webhook
public/
├── pwa-192x192.png              # Manifest icon
├── pwa-512x512.png              # Manifest icon
├── apple-touch-icon.png         # iOS home screen icon (180x180)
├── maskable-icon-512x512.png    # Maskable icon for Android
└── offline.html                 # Offline fallback page (optional, SW handles)
```

### Pattern 1: injectManifest Service Worker with Push
**What:** Custom service worker file (`app/sw.ts`) that handles both Workbox precaching and Web Push events.
**When to use:** Always -- required because `generateSW` cannot include custom push event listeners.
**Example:**
```typescript
// app/sw.ts -- built by vite-plugin-pwa via injectManifest
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

declare let self: ServiceWorkerGlobalScope

// Precache app shell (injected by vite-plugin-pwa at build time)
precacheAndRoute(self.__WB_MANIFEST)

// Offline fallback for navigation requests
const navigationHandler = new NetworkFirst({
  cacheName: 'pages',
  networkTimeoutSeconds: 3,
})
registerRoute(new NavigationRoute(navigationHandler))

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: { url: '/' },
    })
  )
})

// Notification click -- open task board (D-10)
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(url))
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    })
  )
})

// Skip waiting on update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
```

### Pattern 2: Push Subscription Flow
**What:** Client requests push permission, gets subscription object, sends to server for storage.
**When to use:** When user clicks "Enable" on the permission card (D-01).
**Example:**
```typescript
// app/lib/push.ts
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  })
  return subscription
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}
```

### Pattern 3: Supabase Edge Function for Push Dispatch
**What:** Edge Function receives webhook payload on task INSERT, fans out Web Push to all subscribers.
**When to use:** Triggered automatically by database webhook.
**Example:**
```typescript
// supabase/functions/notify-task/index.ts
import webpush from 'npm:web-push'
import { createClient } from 'npm:@supabase/supabase-js@2'

interface WebhookPayload {
  type: 'INSERT'
  table: string
  schema: string
  record: {
    id: string
    client_name: string
    request_type: string
    [key: string]: unknown
  }
  old_record: null
}

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
)

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json()
  const { client_name, request_type } = payload.record

  // Fetch all push subscriptions
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')

  if (error || !subscriptions) {
    return new Response(JSON.stringify({ error: error?.message }), { status: 500 })
  }

  const notification = JSON.stringify({
    title: 'New Task',
    body: `${client_name} — ${request_type}`,
  })

  // Fan out to all subscribers (3-5 people, no batching needed)
  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        notification,
      )
    ),
  )

  // Clean up expired subscriptions (410 Gone)
  const expired = results
    .map((r, i) => (r.status === 'rejected' && r.reason?.statusCode === 410 ? subscriptions[i] : null))
    .filter(Boolean)

  if (expired.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', expired.map((e) => e!.endpoint))
  }

  return new Response(JSON.stringify({ sent: subscriptions.length, expired: expired.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### Pattern 4: Database Webhook via SQL Migration
**What:** Create the webhook in a SQL migration so it's version-controlled.
**Example:**
```sql
-- In supabase/migrations/0002_push_subscriptions.sql

-- Push subscriptions table
CREATE TABLE public.push_subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   text NOT NULL UNIQUE,
  p256dh     text NOT NULL,
  auth       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Staff can only manage their own subscriptions
CREATE POLICY "staff can read own subscriptions"
  ON public.push_subscriptions FOR SELECT TO authenticated
  USING (staff_id = auth.uid());

CREATE POLICY "staff can insert own subscriptions"
  ON public.push_subscriptions FOR INSERT TO authenticated
  WITH CHECK (staff_id = auth.uid());

CREATE POLICY "staff can delete own subscriptions"
  ON public.push_subscriptions FOR DELETE TO authenticated
  USING (staff_id = auth.uid());

-- Database webhook: trigger Edge Function on task INSERT
CREATE TRIGGER notify_new_task
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    'https://<PROJECT_REF>.supabase.co/functions/v1/notify-task',
    'POST',
    '{"Content-Type":"application/json","Authorization":"Bearer <SUPABASE_SERVICE_ROLE_KEY>"}',
    '{}',
    '5000'
  );
```

**Note:** The webhook URL and auth header contain secrets -- these must be set via the Supabase Dashboard for production (not hardcoded in migration). The SQL trigger approach works for local dev; production should use Dashboard webhook configuration or environment-specific migration.

### Anti-Patterns to Avoid
- **Triggering push from client-side after task creation:** Creates a round-trip and fails if user closes browser. Use DB webhook instead.
- **Using `generateSW` strategy when you need push:** `generateSW` does not support custom push event listeners. Must use `injectManifest`.
- **Caching API responses in service worker:** Per D-05, we only cache the app shell. Caching stale task data risks showing incorrect information.
- **Prompting for push permission on page load:** Browsers will auto-deny. Must be triggered by user gesture (button click) per D-01.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Service worker generation | Manual SW file without build pipeline | vite-plugin-pwa + Workbox | Precache manifest injection, cache versioning, update lifecycle |
| Web Push protocol | Raw HTTP to push endpoints with encryption | `web-push` npm library | RFC 8291 encryption is complex; library handles VAPID signing, payload encryption |
| PWA manifest | Hand-written manifest.json | vite-plugin-pwa manifest config | Auto-generates from config, handles icon references, integrates with SW |
| Base64url conversion | Custom encoding for VAPID keys | `urlBase64ToUint8Array` utility | Standard pattern, well-tested, avoids subtle encoding bugs |
| Offline detection | Polling or manual XHR checks | `navigator.onLine` + `online`/`offline` events | Browser-native, no overhead |

**Key insight:** The Web Push protocol involves asymmetric encryption (ECDH + HKDF + AESGCM) that is extremely error-prone to implement manually. The `web-push` library abstracts this entirely.

## Common Pitfalls

### Pitfall 1: iOS Push Only Works in Standalone PWA Mode
**What goes wrong:** Push permission is requested but fails silently on iOS Safari because the app is not installed to the home screen.
**Why it happens:** Apple requires `display: standalone` in the manifest AND the app must be launched from the home screen for Web Push to work on iOS 16.4+.
**How to avoid:** Check `window.matchMedia('(display-mode: standalone)').matches` before showing push permission card on iOS. If not standalone, show install banner first.
**Warning signs:** `Notification.requestPermission()` resolves to `'denied'` without showing a prompt on iOS Safari.

### Pitfall 2: Service Worker Not Updating After Code Changes
**What goes wrong:** Users keep getting old cached content after a deploy.
**Why it happens:** Service worker lifecycle requires explicit activation. Old SW stays active until all tabs are closed.
**How to avoid:** Use `registerType: 'autoUpdate'` in vite-plugin-pwa config and include `skipWaiting()` on message event in custom SW. Consider also calling `self.skipWaiting()` directly for push-based PWAs.
**Warning signs:** Console shows "New service worker waiting to activate" but old content persists.

### Pitfall 3: Push Subscription Becomes Stale (410 Gone)
**What goes wrong:** Edge Function tries to send push to an endpoint that no longer exists (user uninstalled browser, cleared data, etc.).
**Why it happens:** Push service returns 410 Gone for expired subscriptions.
**How to avoid:** In the Edge Function, catch 410 responses and delete the subscription from `push_subscriptions` table. Already shown in the code example above.
**Warning signs:** Edge Function logs show repeated 410 errors.

### Pitfall 4: VAPID Keys Mismatch Between Environments
**What goes wrong:** Push subscriptions created with one VAPID public key cannot receive messages signed with a different private key.
**Why it happens:** VAPID keys are generated once and must be consistent across client (public key) and server (private key). Regenerating breaks all existing subscriptions.
**How to avoid:** Generate VAPID keys once, store as environment secrets in both Vercel (for client-side public key) and Supabase (for Edge Function private key). Never regenerate unless invalidating all subscriptions.
**Warning signs:** Push sends fail with authentication errors.

### Pitfall 5: beforeinstallprompt Not Firing on Android
**What goes wrong:** Install banner never appears on Android because the `beforeinstallprompt` event is not captured.
**Why it happens:** The event fires once early in page lifecycle and must be captured immediately. If the listener is registered too late (e.g., after React hydration), it's missed.
**How to avoid:** Register the `beforeinstallprompt` listener in a `<script>` tag in `index.html` or very early in the app lifecycle. Store the event reference globally.
**Warning signs:** Install button exists but does nothing; `deferredPrompt` is always null.

### Pitfall 6: Webhook Secrets in SQL Migration
**What goes wrong:** Service role key is committed to version control in the migration file.
**Why it happens:** The `supabase_functions.http_request` trigger requires the full URL and headers inline in SQL.
**How to avoid:** Use Supabase Dashboard to create the webhook for production (secrets are stored securely). SQL migration can be used for local dev only with placeholder values, or create the webhook programmatically via Supabase Management API.
**Warning signs:** Git history contains service role keys.

### Pitfall 7: EU iOS Users Cannot Use PWA Standalone Mode
**What goes wrong:** iOS users in the EU cannot install the PWA or receive push notifications.
**Why it happens:** Apple removed standalone PWA support in the EU under the Digital Markets Act.
**How to avoid:** This is a known limitation. For this project (Korean massage shop), all users are in South Korea, so this does not apply. Document as a known constraint if the app expands internationally.
**Warning signs:** iOS users report "Add to Home Screen" just creates a Safari bookmark.

## Code Examples

### vite-plugin-pwa Configuration
```typescript
// vite.config.ts addition
import { VitePWA } from 'vite-plugin-pwa'

// Add to plugins array:
VitePWA({
  strategies: 'injectManifest',
  srcDir: 'app',
  filename: 'sw.ts',
  registerType: 'autoUpdate',
  injectRegister: null, // manual registration -- we control when SW registers
  manifest: {
    name: 'Maison Task Board',
    short_name: 'Maison',
    description: 'Task management for Maison massage shop',
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
    scope: '/',
    start_url: '/',
    icons: [
      { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  injectManifest: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
  },
  devOptions: {
    enabled: true, // enable in dev for testing
    type: 'module',
  },
})
```

### Service Worker Registration (manual)
```typescript
// app/lib/sw-register.ts
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        type: 'module',
      })
      console.log('SW registered:', registration.scope)
      return registration
    } catch (error) {
      console.error('SW registration failed:', error)
      return null
    }
  }
  return null
}
```

### Push Subscription Server Function
```typescript
// app/server/push.ts
import { createServerFn } from '@tanstack/react-start'
import { zodValidator } from '@tanstack/zod-adapter'
import { getRequest } from '@tanstack/react-start/server'
import { getSupabaseServerClient } from '~/lib/supabase.server'
import { z } from 'zod'

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

export const savePushSubscription = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(pushSubscriptionSchema))
  .handler(async ({ data }) => {
    const request = getRequest()
    const supabase = getSupabaseServerClient(request.headers)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          staff_id: user.id,
          endpoint: data.endpoint,
          p256dh: data.keys.p256dh,
          auth: data.keys.auth,
        },
        { onConflict: 'endpoint' }
      )

    if (error) throw new Error(error.message)
    return { success: true }
  })

export const deletePushSubscription = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ endpoint: z.string().url() })))
  .handler(async ({ data }) => {
    const request = getRequest()
    const supabase = getSupabaseServerClient(request.headers)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', data.endpoint)
      .eq('staff_id', user.id)

    if (error) throw new Error(error.message)
    return { success: true }
  })
```

### Online Status Hook
```typescript
// app/hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
```

### Install Prompt Hook
```typescript
// app/hooks/useInstallPrompt.ts
import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    )

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return false
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    return choice.outcome === 'accepted'
  }

  const isIOS = typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent)

  return { canInstall: !!deferredPrompt, isStandalone, isIOS, promptInstall }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| FCM/GCM for web push | VAPID-signed Web Push (no Google dependency) | 2018+ | No need for Firebase project; direct push to any browser |
| iOS had no push support | iOS 16.4+ supports Web Push in standalone PWAs | March 2023 | Full push coverage for iOS + Android + desktop |
| vite-plugin-pwa generateSW only | injectManifest for custom SW code | Always available | Required for push event listeners |
| Supabase webhooks via Dashboard only | SQL trigger with `supabase_functions.http_request` | 2024+ | Version-controlled webhook configuration |

**Deprecated/outdated:**
- GCM (Google Cloud Messaging): Replaced by FCM, but for web push use VAPID instead
- `manifest.json` as separate file: vite-plugin-pwa generates it from config
- `importScripts()` in service worker: vite-plugin-pwa v0.15+ builds with Vite/ES modules

## Open Questions

1. **npm:web-push in Supabase Edge Functions (Deno)**
   - What we know: Supabase Edge Functions support npm packages via `npm:` prefix. `web-push` v3.6.7 uses Node crypto APIs.
   - What's unclear: Whether `web-push`'s native crypto dependencies work in Deno's Node compat layer. The `@negrel/webpush` JSR package is a Deno-native alternative.
   - Recommendation: Try `npm:web-push` first. If it fails due to Node crypto compat issues, fall back to `jsr:@negrel/webpush`. Test during Edge Function development.

2. **Database webhook secret management in migrations**
   - What we know: The SQL trigger approach requires inline URL and auth headers. Production secrets should not be in git.
   - What's unclear: Best practice for managing this across environments.
   - Recommendation: Use Supabase Dashboard to create the production webhook manually. Use SQL migration for schema (table, RLS) only. Document the manual webhook setup step.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build + dev server | Yes | 25.2.1 | -- |
| npm | Package management | Yes | 11.6.2 | -- |
| Supabase CLI | Edge Function deploy + migrations | Not verified | -- | Deploy via Supabase Dashboard |
| Vite | Build pipeline (via TanStack Start) | Yes | 7.3.1 | -- |
| Supabase Cloud | Edge Functions + DB webhooks | Yes (existing project) | -- | -- |
| Vercel | Deployment | Yes (existing deployment) | -- | -- |

**Missing dependencies with no fallback:**
- None identified

**Missing dependencies with fallback:**
- Supabase CLI: If not installed locally, Edge Functions can be deployed via the Supabase Dashboard. Migrations can also be run via Dashboard SQL editor.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x + Testing Library |
| Config file | `vite.config.ts` (test section) |
| Quick run command | `npm test -- --run` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NOTF-01 | Push subscription stored on enable | unit | `npx vitest run tests/server/push.test.ts -t "save subscription"` | No -- Wave 0 |
| NOTF-02 | Notification payload has client name + request type | unit | `npx vitest run tests/server/push.test.ts -t "notification payload"` | No -- Wave 0 |
| NOTF-03 | Permission card shows/hides based on state | unit | `npx vitest run tests/components/PushPermissionCard.test.tsx` | No -- Wave 0 |
| PWA-01 | Manifest configured correctly | unit | `npx vitest run tests/pwa/manifest.test.ts` | No -- Wave 0 |
| PWA-02 | Offline banner shown when offline | unit | `npx vitest run tests/components/OfflineBanner.test.tsx` | No -- Wave 0 |
| PWA-03 | Mobile responsive (existing) | manual-only | Manual viewport test | N/A |

### Sampling Rate
- **Per task commit:** `npm test -- --run`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/server/push.test.ts` -- covers NOTF-01, NOTF-02 (server function for subscription storage)
- [ ] `tests/components/PushPermissionCard.test.tsx` -- covers NOTF-03
- [ ] `tests/components/OfflineBanner.test.tsx` -- covers PWA-02
- [ ] `tests/components/InstallBanner.test.tsx` -- covers PWA-01 UX
- [ ] `tests/pwa/manifest.test.ts` -- covers PWA-01 configuration

## Sources

### Primary (HIGH confidence)
- [vite-plugin-pwa official docs](https://vite-pwa-org.netlify.app/guide/) -- plugin configuration, injectManifest strategy, manifest options
- [vite-plugin-pwa injectManifest guide](https://vite-pwa-org.netlify.app/workbox/inject-manifest.html) -- custom service worker setup, TypeScript support
- [web-push npm](https://www.npmjs.com/package/web-push) -- v3.6.7, VAPID key generation, push sending API
- [Supabase Database Webhooks docs](https://supabase.com/docs/guides/database/webhooks) -- webhook payload format, SQL trigger creation
- [Supabase Push Notifications guide](https://supabase.com/docs/guides/functions/examples/push-notifications) -- Edge Function pattern for push dispatch
- [Supabase Edge Functions NPM compatibility](https://supabase.com/features/npm-compatibility) -- npm: prefix imports in Deno

### Secondary (MEDIUM confidence)
- [Deno Web Push with @negrel/webpush](https://www.negrel.dev/blog/deno-web-push-notifications/) -- Deno-native alternative for VAPID push
- [iOS PWA push support status (Brainhub)](https://brainhub.eu/library/pwa-on-ios) -- iOS 16.4+ requirements, standalone mode requirement
- [PWA iOS limitations (MagicBell 2026)](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide) -- EU limitations, current iOS constraints

### Tertiary (LOW confidence)
- npm:web-push compatibility in Supabase Edge Functions -- not verified by any specific source; needs testing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- vite-plugin-pwa and web-push are well-established, versions verified via npm registry
- Architecture: HIGH -- patterns follow official docs and established PWA/Web Push standards
- Pitfalls: HIGH -- iOS constraints well-documented; service worker lifecycle is a known challenge area
- Edge Function push dispatch: MEDIUM -- npm:web-push in Deno is plausible but unverified in production

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (30 days -- stable domain, libraries are mature)

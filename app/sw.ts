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
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
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

import { useState, useEffect, useCallback } from 'react'
import { subscribeToPush, getExistingSubscription } from '~/lib/push'
import { savePushSubscription, deletePushSubscription } from '~/server/push'

type PushPermission = 'default' | 'granted' | 'denied' | 'dismissed'

const PUSH_DISMISSED_KEY = 'maison-push-dismissed'

export function usePushSubscription({
  isStandalone,
  isIOS,
}: {
  isStandalone: boolean
  isIOS: boolean
}) {
  const [permission, setPermission] = useState<PushPermission>('default')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) {
      setPermission('denied')
      return
    }

    const browserPermission = Notification.permission
    const dismissed = localStorage.getItem(PUSH_DISMISSED_KEY) === 'true'

    if (browserPermission === 'granted') {
      setPermission('granted')
    } else if (browserPermission === 'denied') {
      setPermission('denied')
    } else if (dismissed) {
      setPermission('dismissed')
    } else {
      setPermission('default')
    }
  }, [])

  const subscribe = useCallback(async () => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    if (!('serviceWorker' in navigator)) return

    // iOS requires standalone mode for push
    if (isIOS && !isStandalone) return

    const result = await Notification.requestPermission()

    if (result === 'granted') {
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        console.error('VITE_VAPID_PUBLIC_KEY not configured')
        return
      }

      const subscription = await subscribeToPush(vapidPublicKey)
      if (subscription) {
        const json = subscription.toJSON()
        await savePushSubscription({
          data: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: json.keys?.p256dh ?? '',
              auth: json.keys?.auth ?? '',
            },
          },
        })
      }

      // Clear any previous dismissal
      localStorage.removeItem(PUSH_DISMISSED_KEY)
      setPermission('granted')
    } else if (result === 'denied') {
      setPermission('denied')
    }
  }, [isIOS, isStandalone])

  const unsubscribe = useCallback(async () => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const existing = await getExistingSubscription()
    if (existing) {
      await deletePushSubscription({ data: { endpoint: existing.endpoint } })
      await existing.unsubscribe()
    }

    setPermission('default')
  }, [])

  const dismiss = useCallback(() => {
    localStorage.setItem(PUSH_DISMISSED_KEY, 'true')
    setPermission('dismissed')
  }, [])

  return {
    permission,
    subscribe,
    unsubscribe,
    dismiss,
    isSubscribed: permission === 'granted',
  }
}

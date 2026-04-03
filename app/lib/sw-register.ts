export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
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

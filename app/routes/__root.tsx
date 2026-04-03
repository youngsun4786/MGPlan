import { useEffect } from 'react'
import { createRootRoute, Outlet, HeadContent, Scripts } from '@tanstack/react-router'
import appCss from '~/styles/globals.css?url'
import { registerServiceWorker } from '~/lib/sw-register'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#ffffff' },
      { title: 'Maison Task Board' },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-white font-sans antialiased">
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}

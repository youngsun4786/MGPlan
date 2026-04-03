import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '~/server/auth'
import { getRequest } from '@tanstack/react-start/server'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) {
      // Only show "expired" if there was a session cookie (user was previously logged in)
      const request = getRequest()
      const hasCookie = (request.headers.get('cookie') ?? '').includes('sb-')
      throw redirect({ to: '/login', search: hasCookie ? { expired: 'true' } : {} })
    }
    return { user }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return <Outlet />
}

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '~/server/auth'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({ to: '/login', search: { expired: 'true' } })
    }
    return { user }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return <Outlet />
}

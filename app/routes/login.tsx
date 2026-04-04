import { useState } from 'react'
import { createFileRoute, redirect, useSearch, Link } from '@tanstack/react-router'
import { supabaseBrowserClient } from '~/lib/supabase.browser'
import { getCurrentUser } from '~/server/auth'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    expired: search.expired === 'true' ? ('true' as const) : undefined,
  }),
  beforeLoad: async () => {
    // Use server function (not browser client) because beforeLoad runs on server during SSR
    const user = await getCurrentUser()
    if (user) throw redirect({ to: '/' })
  },
  component: LoginPage,
})

function LoginPage() {
  const { expired } = useSearch({ from: '/login' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error: authError } = await supabaseBrowserClient.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    // D-10: redirect to board
    window.location.href = '/'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="mx-4 w-full max-w-[400px] rounded-lg bg-white p-8 shadow-sm">
        <h1 className="text-[28px] font-semibold leading-[1.2]">Maison Task Board</h1>
        <h2 className="mt-2 text-[20px] font-semibold leading-[1.2]">Sign in to Maison</h2>

        {expired === 'true' && (
          <p className="mt-4 text-sm text-slate-600">Your session expired. Please sign in again.</p>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <Input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="min-h-[44px] w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

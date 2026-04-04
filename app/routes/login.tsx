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

    window.location.href = '/'
  }

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px]" />

      <div className="relative z-10 mx-4 w-full max-w-[420px]">
        <div className="glass-strong rounded-2xl p-8">
          {/* Logo mark */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center glow-accent">
              <span className="text-primary font-heading font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">Maison</h1>
              <p className="text-xs text-muted-foreground tracking-wide uppercase">Task Board</p>
            </div>
          </div>

          <h2 className="font-heading text-2xl font-semibold tracking-tight">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>

          {expired === 'true' && (
            <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
              <p className="text-sm text-destructive">Your session expired. Please sign in again.</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Email</label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="h-11 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 focus-visible:border-primary/30 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Password</label>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-11 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 focus-visible:border-primary/30 rounded-xl"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all glow-accent"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { supabaseBrowserClient } from '~/lib/supabase.browser'
import { getCurrentUser } from '~/server/auth'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

export const Route = createFileRoute('/signup')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (user) throw redirect({ to: '/' })
  },
  component: SignupPage,
})

function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const firstName = (formData.get('firstName') as string).trim()
    const lastName = (formData.get('lastName') as string).trim()
    const email = (formData.get('email') as string).trim()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error: authError } = await supabaseBrowserClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          display_name: `${firstName} ${lastName}`,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

        <div className="relative z-10 mx-4 w-full max-w-[420px]">
          <div className="glass-strong rounded-2xl p-8 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center glow-accent mb-6">
              <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Check your email</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              We've sent a confirmation link to your email address. Click the link to activate your account.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const inputClasses = "h-11 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 focus-visible:border-primary/30 rounded-xl"

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute top-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-primary/8 blur-[100px]" />

      <div className="relative z-10 mx-4 w-full max-w-[420px]">
        <div className="glass-strong rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center glow-accent">
              <span className="text-primary font-heading font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">Maison</h1>
              <p className="text-xs text-muted-foreground tracking-wide uppercase">Task Board</p>
            </div>
          </div>

          <h2 className="font-heading text-2xl font-semibold tracking-tight">Create an account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Join your team on Maison</p>

          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-sm text-muted-foreground">First name</label>
                <Input name="firstName" type="text" placeholder="Jane" required className={inputClasses} />
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-sm text-muted-foreground">Last name</label>
                <Input name="lastName" type="text" placeholder="Kim" required className={inputClasses} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Email</label>
              <Input name="email" type="email" placeholder="you@example.com" required className={inputClasses} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Password</label>
              <Input name="password" type="password" placeholder="••••••••" required minLength={6} className={inputClasses} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Confirm password</label>
              <Input name="confirmPassword" type="password" placeholder="••••••••" required minLength={6} className={inputClasses} />
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
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="mx-4 w-full max-w-[400px] rounded-lg bg-white p-8 shadow-sm text-center">
          <h1 className="text-[28px] font-semibold leading-[1.2]">Maison Task Board</h1>
          <h2 className="mt-2 text-[20px] font-semibold leading-[1.2]">Account created</h2>
          <p className="mt-4 text-sm text-slate-600">
            Check your email to confirm your account, then sign in.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="mx-4 w-full max-w-[400px] rounded-lg bg-white p-8 shadow-sm">
        <h1 className="text-[28px] font-semibold leading-[1.2]">Maison Task Board</h1>
        <h2 className="mt-2 text-[20px] font-semibold leading-[1.2]">Create an account</h2>

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <div className="flex gap-3">
            <Input
              name="firstName"
              type="text"
              placeholder="First name"
              required
              className="min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            />
            <Input
              name="lastName"
              type="text"
              placeholder="Last name"
              required
              className="min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            />
          </div>
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
            minLength={6}
            className="min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          />
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            required
            minLength={6}
            className="min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="min-h-[44px] w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

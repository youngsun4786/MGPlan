import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '~/lib/supabase.server'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  const cookieHeader = request.headers.get('cookie') ?? ''
  console.log(
    '[auth] getCurrentUser called, cookies present:',
    cookieHeader.length > 0,
    'sb- cookies:',
    cookieHeader.includes('sb-'),
  )
  const supabase = getSupabaseServerClient(request.headers)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  console.log(
    '[auth] getUser result:',
    user ? `user=${user.id}` : 'null',
    error ? `error=${error.message}` : 'no error',
  )
  if (error || !user) return null

  // Fetch staff record for display_name
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('id, email, display_name')
    .eq('id', user.id)
    .single()

  console.log(
    '[auth] staff query:',
    staff ? `found=${staff.display_name}` : 'null',
    staffError ? `error=${staffError.message}` : 'no error',
  )

  // If staff record doesn't exist yet, return basic user info as fallback
  if (!staff) {
    const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'
    return {
      id: user.id,
      email: user.email ?? '',
      display_name: displayName,
    }
  }

  return staff
})

function isEmailAllowed(email: string): boolean {
  const allowlist = process.env.ALLOWED_SIGNUP_EMAILS
  if (!allowlist) return false // no allowlist configured = no signups allowed
  const allowed = allowlist.split(',').map((e) => e.trim().toLowerCase())
  return allowed.includes(email.toLowerCase())
}

export const signUpUser = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(signUpSchema))
  .handler(async ({ data }) => {
    if (!isEmailAllowed(data.email)) {
      return { success: false as const, error: 'This email is not authorized to sign up.' }
    }

    const request = getRequest()
    const supabase = getSupabaseServerClient(request.headers)

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          display_name: `${data.firstName} ${data.lastName}`,
        },
      },
    })

    if (error) {
      return { success: false as const, error: error.message }
    }

    return { success: true as const }
  })

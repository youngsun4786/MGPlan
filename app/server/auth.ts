import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '~/lib/supabase.server'
import { getRequest } from '@tanstack/react-start/server'

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

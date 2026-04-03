import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '~/lib/supabase.server'
import { getRequest } from '@tanstack/react-start/server'

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  const supabase = getSupabaseServerClient(request.headers)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null

  // Fetch staff record for display_name
  const { data: staff } = await supabase
    .from('staff')
    .select('id, email, display_name')
    .eq('id', user.id)
    .single()

  return staff
})

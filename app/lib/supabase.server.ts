import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import { setCookie } from '@tanstack/react-start/server'
import type { Database } from './database.types'

export function getSupabaseServerClient(requestHeaders?: Headers) {
  const cookies = parseCookieHeader(requestHeaders?.get('cookie') ?? '')
  return createServerClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () =>
        cookies.filter((c): c is { name: string; value: string } => c.value !== undefined),
      setAll: (cookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(name, value, options)
        }
      },
    },
  })
}

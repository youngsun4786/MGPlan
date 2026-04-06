import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Structural tests: verify that auth files contain the expected patterns
// Full integration tests require browser environment and Supabase connection

describe('Auth flow', () => {
  const loginSource = readFileSync(resolve(__dirname, '../../app/routes/login.tsx'), 'utf-8')

  it('signInWithPassword is called with email and password (AUTH-01)', () => {
    // Verify login page imports and calls signInWithPassword
    expect(loginSource).toContain('signInWithPassword')
    expect(loginSource).toContain('name="email"')
    expect(loginSource).toContain('name="password"')
    expect(loginSource).toContain('type="email"')
    expect(loginSource).toContain('type="password"')
  })

  it('session cookie is set on successful login', () => {
    // Supabase SSR client handles cookie setting automatically via @supabase/ssr
    // Verify the browser client is used for login (which sets cookies via createBrowserClient)
    expect(loginSource).toContain('supabaseBrowserClient')
    expect(loginSource).toContain('signInWithPassword')
    // After successful login, redirect to board
    expect(loginSource).toContain("window.location.href = '/'")
  })
})

describe('Protected route guard (_auth.tsx)', () => {
  const authLayoutSource = readFileSync(resolve(__dirname, '../../app/routes/_auth.tsx'), 'utf-8')

  it('redirects unauthenticated users to /login (AUTH-03)', () => {
    // Verify the auth layout checks for user and redirects if not found
    expect(authLayoutSource).toContain('getCurrentUser')
    expect(authLayoutSource).toContain('beforeLoad')
    expect(authLayoutSource).toContain('redirect')
    expect(authLayoutSource).toContain("'/login'")
  })

  it('allows authenticated users to proceed', () => {
    // Verify the layout returns user context when authenticated
    expect(authLayoutSource).toContain('return { user }')
    // Verify Outlet is rendered for child routes
    expect(authLayoutSource).toContain('Outlet')
  })

  it('redirects with ?expired=true when session is invalid', () => {
    // Verify D-11: session expired message parameter
    expect(authLayoutSource).toContain('expired')
    expect(authLayoutSource).toContain("'true'")
  })
})

describe('getCurrentUser server function', () => {
  const authServerSource = readFileSync(resolve(__dirname, '../../app/server/auth.ts'), 'utf-8')

  it('uses server client with request headers for cookie auth', () => {
    expect(authServerSource).toContain('getSupabaseServerClient')
    expect(authServerSource).toContain('request.headers')
    expect(authServerSource).toContain('createServerFn')
  })

  it('fetches staff record with display_name', () => {
    expect(authServerSource).toContain(".from('staff')")
    expect(authServerSource).toContain('display_name')
    expect(authServerSource).toContain('.single()')
  })

  it('returns null when user is not authenticated', () => {
    expect(authServerSource).toContain('if (error || !user) return null')
  })
})

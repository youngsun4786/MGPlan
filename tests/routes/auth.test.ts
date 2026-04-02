import { describe, it } from 'vitest'

describe('Auth flow', () => {
  it.todo('signInWithPassword is called with email and password (AUTH-01)')
  it.todo('session cookie is set on successful login')
})

describe('Protected route guard (_auth.tsx)', () => {
  it.todo('redirects unauthenticated users to /login (AUTH-03)')
  it.todo('allows authenticated users to proceed')
  it.todo('redirects with ?expired=true when session is invalid')
})

import { describe, it, expect, beforeEach } from 'vitest'
import { extractionResultSchema } from '../../app/lib/extraction-types'

// Test the rate limiter logic directly (reimplemented to avoid import side-effects)
describe('rate limiter logic', () => {
  let rateLimitMap: Map<string, { count: number; resetAt: number }>
  const MAX_PER_HOUR = 10

  function checkRateLimit(userId: string): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(userId)
    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(userId, { count: 1, resetAt: now + 60 * 60 * 1000 })
      return true
    }
    if (entry.count >= MAX_PER_HOUR) return false
    entry.count++
    return true
  }

  beforeEach(() => {
    rateLimitMap = new Map()
  })

  it('allows first request from a user', () => {
    expect(checkRateLimit('user-1')).toBe(true)
  })

  it('allows up to 10 requests per hour', () => {
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit('user-1')).toBe(true)
    }
  })

  it('rejects the 11th request within an hour', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('user-1')
    }
    expect(checkRateLimit('user-1')).toBe(false)
  })

  it('tracks users independently', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('user-1')
    }
    // user-1 is exhausted, but user-2 should still work
    expect(checkRateLimit('user-2')).toBe(true)
  })
})

describe('Claude response JSON parsing', () => {
  it('parses clean JSON response', () => {
    const responseText = JSON.stringify({
      client_name: 'Park',
      phone: '010-9876-5432',
      service: null,
      preferred_datetime: null,
      notes: null,
      request_type: 'new_booking',
      confidence: {
        client_name: 0.9,
        phone: 0.85,
        service: 0.0,
        preferred_datetime: 0.0,
        notes: 0.0,
        request_type: 0.7,
      },
    })
    const jsonStr = responseText.replace(/^```(?:json)?\n?/gm, '').replace(/\n?```$/gm, '').trim()
    const parsed = JSON.parse(jsonStr)
    const result = extractionResultSchema.safeParse(parsed)
    expect(result.success).toBe(true)
  })

  it('strips markdown code fences from Claude response', () => {
    const responseText = '```json\n{"client_name":"Lee","phone":null,"service":null,"preferred_datetime":null,"notes":null,"request_type":null,"confidence":{"client_name":0.8,"phone":0.0,"service":0.0,"preferred_datetime":0.0,"notes":0.0,"request_type":0.0}}\n```'
    const jsonStr = responseText.replace(/^```(?:json)?\n?/gm, '').replace(/\n?```$/gm, '').trim()
    const parsed = JSON.parse(jsonStr)
    const result = extractionResultSchema.safeParse(parsed)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.client_name).toBe('Lee')
    }
  })

  it('rejects invalid JSON from Claude', () => {
    const responseText = 'I cannot read this image clearly.'
    const jsonStr = responseText.replace(/^```(?:json)?\n?/gm, '').replace(/\n?```$/gm, '').trim()
    expect(() => JSON.parse(jsonStr)).toThrow()
  })
})

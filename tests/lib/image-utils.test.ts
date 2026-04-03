import { describe, it, expect } from 'vitest'
import { validateImageFile, MAX_FILE_SIZE_BYTES } from '../../app/lib/image-utils'
import {
  isLowConfidence,
  extractionResultSchema,
  LOW_CONFIDENCE_THRESHOLD,
} from '../../app/lib/extraction-types'
import { screenshotInputSchema } from '../../app/lib/schemas'

describe('validateImageFile', () => {
  it('rejects files larger than 10MB', () => {
    const file = new File(['x'], 'big.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: MAX_FILE_SIZE_BYTES + 1 })
    const result = validateImageFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('too large')
  })

  it('rejects unsupported file types like application/pdf', () => {
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' })
    const result = validateImageFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Unsupported format')
  })

  it('accepts PNG files under 10MB', () => {
    const file = new File(['x'], 'test.png', { type: 'image/png' })
    expect(validateImageFile(file).valid).toBe(true)
  })

  it('accepts JPEG files under 10MB', () => {
    const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' })
    expect(validateImageFile(file).valid).toBe(true)
  })

  it('accepts WebP files under 10MB', () => {
    const file = new File(['x'], 'test.webp', { type: 'image/webp' })
    expect(validateImageFile(file).valid).toBe(true)
  })

  it('accepts HEIC files by extension even with generic MIME type', () => {
    const file = new File(['x'], 'photo.heic', { type: 'application/octet-stream' })
    expect(validateImageFile(file).valid).toBe(true)
  })
})

describe('isLowConfidence', () => {
  it('returns true for score 0.5 (below threshold)', () => {
    expect(isLowConfidence(0.5)).toBe(true)
  })

  it('returns false for score 0.0 (null/not-found -- no warning needed)', () => {
    expect(isLowConfidence(0.0)).toBe(false)
  })

  it('returns false for score 0.8 (above threshold -- confident)', () => {
    expect(isLowConfidence(0.8)).toBe(false)
  })

  it('returns true for score just below threshold', () => {
    expect(isLowConfidence(LOW_CONFIDENCE_THRESHOLD - 0.01)).toBe(true)
  })

  it('returns false for score at exactly the threshold', () => {
    expect(isLowConfidence(LOW_CONFIDENCE_THRESHOLD)).toBe(false)
  })
})

describe('extractionResultSchema', () => {
  const validExtraction = {
    client_name: 'Kim',
    phone: '010-1234-5678',
    service: 'Swedish massage',
    preferred_datetime: '2026-04-05T14:00:00',
    notes: 'First visit',
    request_type: 'new_booking',
    confidence: {
      client_name: 0.9,
      phone: 0.95,
      service: 0.8,
      preferred_datetime: 0.7,
      notes: 0.6,
      request_type: 0.85,
    },
  }

  it('validates a correct extraction object', () => {
    const result = extractionResultSchema.safeParse(validExtraction)
    expect(result.success).toBe(true)
  })

  it('rejects an object with missing confidence fields', () => {
    const invalid = {
      ...validExtraction,
      confidence: { client_name: 0.9 }, // missing other fields
    }
    const result = extractionResultSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('allows null values for extracted fields', () => {
    const withNulls = {
      ...validExtraction,
      client_name: null,
      phone: null,
      service: null,
      preferred_datetime: null,
      notes: null,
      request_type: null,
    }
    const result = extractionResultSchema.safeParse(withNulls)
    expect(result.success).toBe(true)
  })
})

describe('screenshotInputSchema', () => {
  it('validates correct input with imageBase64 and mediaType', () => {
    const result = screenshotInputSchema.safeParse({
      imageBase64: 'abc123base64data',
      mediaType: 'image/jpeg',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty imageBase64', () => {
    const result = screenshotInputSchema.safeParse({
      imageBase64: '',
      mediaType: 'image/jpeg',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid mediaType', () => {
    const result = screenshotInputSchema.safeParse({
      imageBase64: 'abc123',
      mediaType: 'application/pdf',
    })
    expect(result.success).toBe(false)
  })
})

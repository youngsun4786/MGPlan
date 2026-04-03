import { describe, it, expect } from 'vitest'
import { validateImageFile, MAX_FILE_SIZE_BYTES } from '../../app/lib/image-utils'
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

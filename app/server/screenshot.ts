import Anthropic from '@anthropic-ai/sdk'
import { createServerFn } from '@tanstack/react-start'
import { zodValidator } from '@tanstack/zod-adapter'
import { getRequest } from '@tanstack/react-start/server'
import { getSupabaseServerClient } from '~/lib/supabase.server'
import { screenshotInputSchema } from '~/lib/schemas'
import { extractionResultSchema } from '~/lib/extraction-types'
import type { ExtractionResponse } from '~/lib/extraction-types'

// In-memory rate limiter (D-12: 10 screenshots/hour/user)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
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

const EXTRACTION_PROMPT = `You are extracting task information from a KakaoTalk messenger screenshot from a Korean massage shop.

Extract the following fields from the screenshot. The text may be in Korean, English, or mixed.

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "client_name": "string or null",
  "phone": "string or null (Korean format: 010-XXXX-XXXX)",
  "service": "string or null (massage type or service requested)",
  "preferred_datetime": "string or null (ISO 8601 format if a date/time is mentioned)",
  "notes": "string or null (any additional context or special requests)",
  "request_type": "new_booking | change_time | change_therapist | other | null",
  "confidence": {
    "client_name": 0.0-1.0,
    "phone": 0.0-1.0,
    "service": 0.0-1.0,
    "preferred_datetime": 0.0-1.0,
    "notes": 0.0-1.0,
    "request_type": 0.0-1.0
  }
}

Rules:
- If a field is not visible or cannot be determined, set it to null with confidence 0.0
- Korean phone numbers follow the pattern 010-XXXX-XXXX or 02-XXXX-XXXX
- For request_type, default to "new_booking" if it appears to be a new customer inquiry
- Confidence 1.0 = clearly visible and unambiguous. 0.5 = partially visible or inferred. Below 0.3 = guessing
- Translate Korean text to English for the extracted values where appropriate (except names)
- Keep Korean names in Korean characters`

export const processScreenshot = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(screenshotInputSchema))
  .handler(async ({ data }): Promise<ExtractionResponse> => {
    const request = getRequest()
    const supabase = getSupabaseServerClient(request.headers)

    // 1. Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 2. Rate limit check (D-12)
    if (!checkRateLimit(user.id)) {
      return { success: false, error: 'Screenshot limit reached (10/hour). Try again soon.' }
    }

    try {
      // 3. Prepare image buffer for storage upload
      const fileName = `${crypto.randomUUID()}.jpg`
      const buffer = Buffer.from(data.imageBase64, 'base64')

      // 4. PARALLEL: Claude Vision API call + Supabase Storage upload
      //    This is critical to stay within Vercel's 10s timeout.
      //    Claude Vision: 3-8s, Storage upload: 1-3s
      //    Sequential would risk 4-11s; parallel keeps it at max(3-8s, 1-3s) = 3-8s
      const [message, uploadResult] = await Promise.all([
        // Claude Vision API extraction
        new Anthropic().messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: data.mediaType,
                    data: data.imageBase64,
                  },
                },
                { type: 'text', text: EXTRACTION_PROMPT },
              ],
            },
          ],
        }),
        // Supabase Storage upload (runs concurrently)
        supabase.storage
          .from('screenshots')
          .upload(fileName, buffer, { contentType: data.mediaType, upsert: false }),
      ])

      // 5. Parse Claude response -- handle potential markdown code fences
      const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
      const jsonStr = responseText
        .replace(/^```(?:json)?\n?/gm, '')
        .replace(/\n?```$/gm, '')
        .trim()
      const parsed = JSON.parse(jsonStr)
      const extraction = extractionResultSchema.parse(parsed)

      // 6. Get signed URL (bucket is private, so use createSignedUrl instead of getPublicUrl)
      let screenshotUrl = ''
      if (!uploadResult.error) {
        const { data: signedUrlData } = await supabase.storage
          .from('screenshots')
          .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year expiry
        screenshotUrl = signedUrlData?.signedUrl ?? ''
      } else {
        console.error('[screenshot] Storage upload failed:', uploadResult.error.message)
        // Still return extraction even if storage fails
      }

      return {
        success: true,
        extraction,
        screenshotUrl,
      }
    } catch (error) {
      console.error('[screenshot] Processing failed:', error)
      return {
        success: false,
        error: "Couldn't read the screenshot. Enter details manually.",
      }
    }
  })

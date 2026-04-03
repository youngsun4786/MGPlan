import { z } from 'zod'

export const LOW_CONFIDENCE_THRESHOLD = 0.7

export function isLowConfidence(score: number): boolean {
  return score > 0 && score < LOW_CONFIDENCE_THRESHOLD
}

export const extractionResultSchema = z.object({
  client_name: z.string().nullable(),
  phone: z.string().nullable(),
  service: z.string().nullable(),
  preferred_datetime: z.string().nullable(),
  notes: z.string().nullable(),
  request_type: z.enum(['new_booking', 'change_time', 'change_therapist', 'other']).nullable(),
  confidence: z.object({
    client_name: z.number().min(0).max(1),
    phone: z.number().min(0).max(1),
    service: z.number().min(0).max(1),
    preferred_datetime: z.number().min(0).max(1),
    notes: z.number().min(0).max(1),
    request_type: z.number().min(0).max(1),
  }),
})

export type ExtractionResult = z.infer<typeof extractionResultSchema>

export type ConfidenceScores = ExtractionResult['confidence']

// Fields that map from extraction to the task creation form
export const EXTRACTION_FIELDS = [
  'client_name', 'phone', 'service', 'preferred_datetime', 'notes', 'request_type',
] as const

export type ExtractionField = typeof EXTRACTION_FIELDS[number]

// Full response from processScreenshot server function
export type ExtractionResponse = {
  success: true
  extraction: ExtractionResult
  screenshotUrl: string
} | {
  success: false
  error: string
}

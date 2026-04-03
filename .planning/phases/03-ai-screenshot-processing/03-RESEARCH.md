# Phase 3: AI Screenshot Processing - Research

**Researched:** 2026-04-03
**Domain:** Claude Vision API integration, image upload/processing, Supabase Storage
**Confidence:** HIGH

## Summary

This phase adds screenshot-to-form functionality: staff upload a KakaoTalk screenshot, the Claude vision API extracts structured task data, and the form pre-fills for review. The technical domain spans three areas: (1) client-side image handling (upload, resize, HEIC conversion), (2) server-side Claude API integration via `createServerFn`, and (3) Supabase Storage for screenshot persistence.

The project already has established patterns for `createServerFn` handlers, Zod validation, react-hook-form, and shadcn UI components. Phase 3 extends these existing patterns rather than introducing new paradigms. The primary technical risk is prompt engineering for reliable extraction from noisy KakaoTalk screenshots with mixed Korean/English text.

**Primary recommendation:** Use `@anthropic-ai/sdk` v0.82.0 with base64 image input and structured JSON output. Use `browser-image-compression` for client-side resize/HEIC-to-JPEG conversion. Store screenshots in a Supabase Storage public bucket with UUID-based file naming.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Dedicated "Upload Screenshot" option inside a '+' dropdown in the header. The existing '+' create button becomes a dropdown with two options: "Upload Screenshot" and "Create Manually". One button, two paths.
- **D-02:** On mobile, upload supports camera capture + gallery selection. Uses `accept='image/*'` with capture attribute.
- **D-03:** Loading state: skeleton form -- open the task form immediately with skeleton/shimmer placeholders in each field. Fields fill in as extraction completes.
- **D-04:** Low-confidence fields get an amber border + warning icon. Tooltip on hover/tap: "AI extracted this -- please verify". Only low-confidence fields are marked.
- **D-05:** Amber border matches the existing amber pattern from the offline banner (`amber-50`/`amber-800` palette).
- **D-06:** Completely unreadable screenshots: open empty form with toast -- "Couldn't read the screenshot -- please enter details manually."
- **D-07:** Partial extraction: fill what we got, leave empty fields empty. Low-confidence fields get amber indicator.
- **D-08:** API timeout or rate limit: toast error + open empty form. Never block task creation.
- **D-09:** Collapsible preview above form fields. Desktop: expanded by default. Mobile (< 640px): collapsed by default.
- **D-10:** Screenshots stored in Supabase Storage in a `screenshots` bucket. Store the public URL in a new `screenshot_url` column on the tasks table.
- **D-11:** Thumbnail on task row -- small image icon/thumbnail on the task row indicating a screenshot is attached. Tapping opens full image in a lightbox.
- **D-12:** Per-user, 10 screenshots per hour. Simple in-memory counter on the server (resets on server restart).
- **D-13:** When rate limit is hit: toast + open empty form.
- **D-14:** Accept PNG, JPEG, HEIC, WebP. Max 10MB. Client-side resize to max 2048px on longest edge before sending to server.
- **D-15:** The '+' button in the header becomes a dropdown menu with two options: "Upload Screenshot" (camera icon) and "Create Manually" (edit icon).

### Claude's Discretion
- Claude vision API prompt engineering (exact prompt text, extraction format)
- Confidence threshold values (what score = "low confidence")
- Image compression library choice (browser-image-compression, canvas API, etc.)
- Supabase Storage bucket configuration (public vs signed URLs, file naming)
- Skeleton shimmer animation implementation details
- Lightbox component choice (existing shadcn dialog or dedicated lightbox)
- DB migration details for `screenshot_url` column and Storage bucket policies

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within Phase 3 scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AI-01 | Staff can upload a KakaoTalk screenshot (drag-and-drop or tap-to-upload on mobile) | Client-side image handling section; browser-image-compression for resize/HEIC; shadcn file input patterns |
| AI-02 | Claude vision API extracts client name, phone, service, date/time, notes, and request type from the screenshot | Anthropic SDK integration section; prompt engineering guidance; structured JSON output pattern |
| AI-03 | Extracted fields pre-fill the task creation form for staff review before saving | Architecture pattern for `extractedData` + `confidence` props on TaskForm; react-hook-form `reset()` pattern |
| AI-04 | Fields with low extraction confidence are visually flagged for staff to verify | Confidence indicator pattern; amber border styling; threshold recommendation |
| AI-05 | Unreadable screenshots fall back gracefully to the manual entry form | Error handling architecture; toast notifications; fallback flow |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@anthropic-ai/sdk` | 0.82.0 | Claude vision API client | Official Anthropic SDK; type-safe; already planned in STACK.md |
| `browser-image-compression` | 2.0.2 | Client-side image resize + HEIC conversion | Handles HEIC-to-JPEG, max dimension resize, runs in web worker; most popular browser image compression library |
| `sonner` | 2.0.7 | Toast notifications | shadcn-compatible toast library; listed in UI-SPEC as required install |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@supabase/supabase-js` | 2.101.1 (installed) | Storage file upload + public URL | Already installed; use `supabase.storage.from('screenshots').upload()` |
| `react-hook-form` | 7.72.0 (installed) | Form pre-fill with extracted data | Already used by TaskForm; use `reset()` to populate extracted values |
| `zod` | 3.24.0 (installed) | Validate extraction response schema | Already installed; validate Claude API response shape |
| `lucide-react` | 0.545.0 (installed) | Icons (Camera, PenLine, AlertTriangle, Image, ChevronDown) | Already installed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `browser-image-compression` | Canvas API directly | Canvas works but requires manual HEIC handling and more code; library handles edge cases |
| `sonner` | Custom toast component | sonner is the shadcn-blessed toast library; no reason to hand-roll |
| Base64 inline | Claude Files API | Files API is beta (`files-api-2025-04-14`); base64 is simpler for single-shot extraction; no benefit for one-off uploads |

**Installation:**
```bash
npm install @anthropic-ai/sdk browser-image-compression sonner
npx shadcn@latest add skeleton tooltip collapsible
```

## Architecture Patterns

### Recommended Project Structure
```
app/
  server/
    screenshot.ts          # createServerFn for screenshot processing + upload
  components/
    ScreenshotUploadDropdown.tsx  # '+' button dropdown (Upload / Create Manually)
    ScreenshotDropZone.tsx        # File input + drag-and-drop zone
    ScreenshotPreview.tsx         # Collapsible image preview above form
    SkeletonFormField.tsx         # Shimmer placeholder during extraction
    ConfidenceIndicator.tsx       # Amber border + warning icon wrapper
    ScreenshotThumbnail.tsx       # Small icon on TaskRow
    ImageLightbox.tsx             # Full-size viewer (shadcn Dialog-based)
  lib/
    image-utils.ts         # Client-side resize, HEIC conversion, validation
    extraction-types.ts    # Types for AI extraction response + confidence
supabase/
  migrations/
    0003_screenshot_storage.sql   # screenshot_url column + Storage bucket + RLS
```

### Pattern 1: Server Function for Screenshot Processing
**What:** A single `createServerFn` that receives a base64-encoded image, sends it to Claude, uploads to Supabase Storage, and returns extracted data with confidence scores.
**When to use:** Every screenshot upload goes through this function.
**Example:**
```typescript
// Source: Anthropic Vision docs + existing createServerFn pattern in app/server/tasks.ts
import Anthropic from '@anthropic-ai/sdk'
import { createServerFn } from '@tanstack/react-start'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'

const screenshotInputSchema = z.object({
  imageBase64: z.string(),
  mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
})

const extractionResultSchema = z.object({
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

export const processScreenshot = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(screenshotInputSchema))
  .handler(async ({ data }) => {
    // 1. Rate limit check (in-memory map)
    // 2. Call Claude vision API with base64 image
    // 3. Parse structured JSON response
    // 4. Upload image to Supabase Storage
    // 5. Return extraction + screenshot URL
  })
```

### Pattern 2: Claude Vision API Call with Structured Output
**What:** Send base64 image to Claude with a system prompt that returns JSON with per-field confidence scores.
**When to use:** Inside the `processScreenshot` server function.
**Example:**
```typescript
// Source: https://platform.claude.com/docs/en/build-with-claude/vision
const anthropic = new Anthropic()

const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',  // Use Sonnet for cost/speed balance
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: data.mediaType,  // 'image/jpeg' | 'image/png' | 'image/webp'
            data: data.imageBase64,
          },
        },
        {
          type: 'text',
          text: EXTRACTION_PROMPT,
        },
      ],
    },
  ],
})
```

### Pattern 3: Client-Side Image Processing Pipeline
**What:** Validate file type/size, convert HEIC to JPEG, resize to max 2048px, then convert to base64 for upload.
**When to use:** After file selection, before sending to server function.
**Example:**
```typescript
// Source: browser-image-compression docs
import imageCompression from 'browser-image-compression'

async function prepareImage(file: File): Promise<{ base64: string; mediaType: string }> {
  // browser-image-compression handles HEIC conversion automatically
  const options = {
    maxSizeMB: 4,           // Keep under Claude's 5MB API limit
    maxWidthOrHeight: 2048, // D-14: max 2048px longest edge
    useWebWorker: true,
    fileType: 'image/jpeg', // Convert everything (including HEIC) to JPEG
  }
  const compressed = await imageCompression(file, options)
  const base64 = await imageCompression.getDataUrlContent(
    await imageCompression.getDataUrlFromFile(compressed)
  )
  return { base64, mediaType: 'image/jpeg' }
}
```

### Pattern 4: Supabase Storage Upload
**What:** Upload the processed image to a `screenshots` bucket and get a public URL.
**When to use:** Inside the server function, after successful extraction.
**Example:**
```typescript
// Source: https://supabase.com/docs/reference/javascript/storage-from-upload
const fileName = `${crypto.randomUUID()}.jpg`
const buffer = Buffer.from(data.imageBase64, 'base64')

const { error: uploadError } = await supabase.storage
  .from('screenshots')
  .upload(fileName, buffer, {
    contentType: data.mediaType,
    upsert: false,
  })

if (uploadError) throw new Error(uploadError.message)

const { data: urlData } = supabase.storage
  .from('screenshots')
  .getPublicUrl(fileName)

// urlData.publicUrl is the permanent URL to store in tasks.screenshot_url
```

### Pattern 5: Form Pre-Fill with Confidence Indicators
**What:** Pass extracted data and confidence scores to TaskForm; use `reset()` to populate fields; wrap low-confidence fields with amber indicator.
**When to use:** When TaskForm opens in screenshot upload mode.
**Example:**
```typescript
// In TaskForm, when extractedData arrives:
useEffect(() => {
  if (extractedData) {
    reset({
      client_name: extractedData.client_name ?? '',
      phone: extractedData.phone ?? '',
      service: extractedData.service ?? '',
      preferred_datetime: extractedData.preferred_datetime,
      notes: extractedData.notes ?? '',
      request_type: extractedData.request_type ?? undefined,
    })
  }
}, [extractedData, reset])
```

### Anti-Patterns to Avoid
- **Calling Claude API from client code:** The `ANTHROPIC_API_KEY` must never be exposed. Always use `createServerFn`.
- **Sending full-resolution images:** Always resize client-side first. A 4000x3000 iPhone photo wastes tokens and adds latency.
- **Blocking task creation on AI success:** Every error path must open an empty form. Staff must always be able to create tasks manually.
- **Using `select('*')` in queries:** Existing convention requires explicit column lists.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image resize + HEIC conversion | Canvas API + manual HEIC decoder | `browser-image-compression` | Handles HEIC, web worker, orientation EXIF, edge cases across browsers |
| Toast notifications | Custom notification component | `sonner` (via shadcn) | shadcn-blessed; handles stacking, animation, accessibility |
| Skeleton shimmer | Custom CSS animation | shadcn `Skeleton` component | Already matches the design system; one line per field |
| Collapsible panel | Manual show/hide state | shadcn `Collapsible` | Radix-based; handles animation, accessibility, keyboard nav |
| Tooltip | Custom hover div | shadcn `Tooltip` | Handles positioning, delay, accessibility (aria-describedby) |
| Dropdown menu | Custom popover | shadcn `DropdownMenu` | Already installed and used by UserMenu; Radix-based |

**Key insight:** The UI-SPEC already specifies shadcn components for all new UI patterns. The only new npm dependency for UI is `sonner`. Everything else uses existing shadcn primitives.

## Common Pitfalls

### Pitfall 1: HEIC Files Silently Fail
**What goes wrong:** iPhone cameras default to HEIC format. If you only check file extension or MIME type, HEIC files may pass validation but fail when sent to Claude (which only accepts JPEG, PNG, GIF, WebP).
**Why it happens:** iOS reports HEIC files with `image/heic` or `image/heif` MIME type. Claude API rejects these.
**How to avoid:** Convert all uploads to JPEG via `browser-image-compression` before sending to the server. Set `fileType: 'image/jpeg'` in compression options.
**Warning signs:** Users on iPhones reporting "failed to process screenshot" with no clear error.

### Pitfall 2: Claude Returns Unstructured or Malformed JSON
**What goes wrong:** The Claude response contains explanatory text mixed with JSON, or the JSON doesn't match the expected schema.
**Why it happens:** Without strict output formatting instructions, Claude may wrap JSON in markdown code blocks or add commentary.
**How to avoid:** Use a system prompt that explicitly requests only JSON output. Parse the response text, strip markdown code fences if present, then validate with Zod. Always have a fallback to empty form.
**Warning signs:** `JSON.parse()` throwing errors in the server function.

### Pitfall 3: Vercel Function Timeout
**What goes wrong:** The `processScreenshot` server function exceeds Vercel's timeout limit (10s on Hobby plan).
**Why it happens:** Claude vision API calls with large images can take 3-8 seconds. Combined with Supabase Storage upload, total time may exceed 10s.
**How to avoid:** (1) Resize images aggressively client-side (2048px max, JPEG quality ~0.8). (2) Use Claude Sonnet (faster than Opus) for extraction. (3) Consider uploading to Supabase Storage in parallel with Claude extraction. (4) If on Hobby plan, monitor latency closely.
**Warning signs:** Intermittent 504 Gateway Timeout errors in production.

### Pitfall 4: Base64 Payload Size in createServerFn
**What goes wrong:** A resized 2048px JPEG image as base64 can be 1-3MB of text. The server function receives this as a JSON string.
**Why it happens:** Base64 encoding adds ~33% overhead. A 2MB image becomes ~2.7MB of base64 text.
**How to avoid:** Client-side compression targets `maxSizeMB: 4` to stay under Claude's 5MB API limit. The Vercel serverless function body limit is 4.5MB by default. Resize to 1568px (Claude's optimal size) instead of 2048px to reduce payload further while matching Claude's internal resize target.
**Warning signs:** 413 Payload Too Large errors from Vercel.

### Pitfall 5: Korean Text Extraction Accuracy
**What goes wrong:** Claude misreads Korean phone numbers (Korean uses different digit grouping: 010-1234-5678) or confuses Korean names with service descriptions.
**Why it happens:** KakaoTalk screenshots have dense Korean text with emoji, timestamps, and call metadata mixed together.
**How to avoid:** Prompt engineering with explicit examples of KakaoTalk screenshot layouts. Include Korean phone number format (010-XXXX-XXXX) in the prompt. Test with real KakaoTalk screenshots during development.
**Warning signs:** Phone numbers consistently wrong; names and services swapped.

### Pitfall 6: Rate Limit State Lost on Serverless Cold Start
**What goes wrong:** In-memory rate limit counter resets every time the Vercel serverless function cold-starts, which can happen every few minutes on low traffic.
**Why it happens:** Serverless functions are stateless. In-memory `Map` lives only for the function's lifecycle.
**How to avoid:** Accept this limitation (D-12 explicitly says "resets on server restart -- acceptable for 3-5 users"). The rate limit is a soft guard, not a security boundary. For true enforcement, use a database counter, but that's over-engineering for this use case.
**Warning signs:** None -- this is a known acceptable limitation per the context decisions.

## Code Examples

### Claude Vision Extraction Prompt
```typescript
// Recommendation: Structured prompt for KakaoTalk screenshot extraction
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
```

### Confidence Threshold Recommendation
```typescript
// Recommendation: 0.7 threshold for "low confidence" indicator
const LOW_CONFIDENCE_THRESHOLD = 0.7

function isLowConfidence(score: number): boolean {
  return score > 0 && score < LOW_CONFIDENCE_THRESHOLD
}
// score === 0 means "not found" (field left empty, no indicator)
// score > 0 && < 0.7 means "extracted but uncertain" (amber indicator)
// score >= 0.7 means "confident" (no indicator)
```

### In-Memory Rate Limiter
```typescript
// Simple per-user rate limiter for serverless (acceptable per D-12)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string, maxPerHour: number = 10): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }

  if (entry.count >= maxPerHour) return false

  entry.count++
  return true
}
```

### Supabase Migration for Screenshot Storage
```sql
-- 0003_screenshot_storage.sql
-- Add screenshot_url column to tasks table
ALTER TABLE public.tasks
  ADD COLUMN screenshot_url text;

-- Create screenshots storage bucket (public, since these are internal staff images)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('screenshots', 'screenshots', true)
  ON CONFLICT (id) DO NOTHING;

-- RLS: Authenticated users can upload to screenshots bucket
CREATE POLICY "authenticated users can upload screenshots"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'screenshots');

-- RLS: Anyone can read screenshots (public bucket, but only staff have the URL)
CREATE POLICY "public read screenshots"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'screenshots');
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| OCR libraries (Tesseract) | Vision LLMs (Claude, GPT-4V) | 2023-2024 | Far better accuracy on noisy screenshots, especially mixed-language |
| Server-side image processing | Client-side resize + compress | Ongoing | Reduces upload time, server load, and API costs |
| Custom file upload UI | Native HTML `<input type="file">` with `accept` + `capture` | Standard | Works reliably across iOS Safari and Android Chrome in PWA mode |
| Claude API `image/heic` | Convert to JPEG client-side | Current | Claude does not accept HEIC; must convert before sending |

**Model choice:** Use Claude Sonnet (not Opus) for extraction. Sonnet is significantly faster (1-3s vs 5-10s) and cheaper, with sufficient accuracy for structured data extraction from screenshots. The speed difference matters for UX and Vercel timeout budgets.

## Open Questions

1. **Optimal image dimensions for this specific use case**
   - What we know: Claude recommends max 1568px; D-14 says 2048px. Claude will internally resize to 1568px anyway.
   - What's unclear: Whether resizing to 1568px client-side (saving tokens + latency) is better than 2048px (preserving more detail for Korean text).
   - Recommendation: Use 1568px as the resize target. It matches Claude's internal processing size and reduces payload. Korean text at 1568px from a phone screenshot should remain legible.

2. **Sonnet model version**
   - What we know: `claude-sonnet-4-20250514` is current Sonnet. Pricing is $3/M input tokens.
   - What's unclear: Whether a future cheaper model would be better for this high-volume, low-complexity extraction task.
   - Recommendation: Start with Sonnet 4. It handles Korean well and is fast enough for the skeleton form UX.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@anthropic-ai/sdk` | AI extraction | Needs install | 0.82.0 | -- |
| `browser-image-compression` | Client image resize | Needs install | 2.0.2 | -- |
| `sonner` | Toast notifications | Needs install | 2.0.7 | -- |
| Supabase Storage | Screenshot persistence | Available (Supabase project) | -- | Store base64 in DB (not recommended) |
| `ANTHROPIC_API_KEY` | Claude API auth | Must be set in .env + Vercel | -- | No fallback; required |
| Supabase CLI | Migration | Available locally | -- | Apply SQL manually via dashboard |

**Missing dependencies with no fallback:**
- `@anthropic-ai/sdk`, `browser-image-compression`, `sonner` -- must be installed via npm
- `ANTHROPIC_API_KEY` -- must be provisioned and set as environment variable

**Missing dependencies with fallback:**
- None

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.0.5 |
| Config file | `vite.config.ts` (vitest config section) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AI-01 | File validation (type, size), image compression pipeline | unit | `npx vitest run tests/server/screenshot.test.ts -t "file validation"` | No -- Wave 0 |
| AI-02 | Claude API extraction returns valid schema; prompt produces expected JSON | unit (mocked API) | `npx vitest run tests/server/screenshot.test.ts -t "extraction"` | No -- Wave 0 |
| AI-03 | Extracted data populates form fields via reset() | unit | `npx vitest run tests/components/TaskForm.test.tsx -t "pre-fill"` | No -- Wave 0 |
| AI-04 | Low-confidence fields render amber border | unit | `npx vitest run tests/components/ConfidenceIndicator.test.tsx` | No -- Wave 0 |
| AI-05 | Error/unreadable fallback opens empty form + toast | unit | `npx vitest run tests/components/ScreenshotUpload.test.tsx -t "fallback"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/server/screenshot.test.ts` -- covers AI-01, AI-02 (mock Anthropic SDK, validate extraction schema)
- [ ] `tests/components/ConfidenceIndicator.test.tsx` -- covers AI-04
- [ ] `tests/components/ScreenshotUpload.test.tsx` -- covers AI-01, AI-05 (file validation, fallback flow)

## Sources

### Primary (HIGH confidence)
- [Anthropic Vision docs](https://platform.claude.com/docs/en/build-with-claude/vision) -- base64 image input format, supported types (JPEG/PNG/GIF/WebP), size limits (5MB API, 1568px optimal), token costs
- [Supabase Storage upload docs](https://supabase.com/docs/reference/javascript/storage-from-upload) -- upload API, getPublicUrl, bucket configuration
- Existing codebase (`app/server/tasks.ts`, `app/components/TaskForm.tsx`) -- established `createServerFn` and react-hook-form patterns

### Secondary (MEDIUM confidence)
- [browser-image-compression npm](https://www.npmjs.com/package/browser-image-compression) -- v2.0.2 features including HEIC support and web worker processing
- npm registry version checks for `@anthropic-ai/sdk` (0.82.0), `sonner` (2.0.7)

### Tertiary (LOW confidence)
- Korean phone number format assumptions (010-XXXX-XXXX) -- based on training data knowledge of Korean telecom; should be validated with real KakaoTalk screenshots during development

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- versions verified via npm registry; Anthropic SDK docs verified via official docs
- Architecture: HIGH -- extends existing patterns (createServerFn, react-hook-form, Supabase) already proven in Phase 1
- Pitfalls: HIGH -- based on documented API limits (Claude 5MB, Vercel 10s timeout, HEIC format) and project constraints
- Prompt engineering: MEDIUM -- prompt structure is solid but accuracy on real KakaoTalk screenshots needs empirical testing

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable domain; Anthropic SDK may release new versions but base64 API is stable)

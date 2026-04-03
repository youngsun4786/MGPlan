# Phase 3: AI Screenshot Processing - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Eliminate manual re-keying. Staff upload a KakaoTalk screenshot and the form pre-fills with extracted data. They review, correct if needed, and save. The screenshot is stored with the task for future reference.

Deliverables:
- Screenshot upload UI (drag-and-drop desktop, camera+gallery mobile)
- TanStack Start `createServerFn` handler proxies image to Claude vision API
- Prompt engineered for KakaoTalk screenshots (mixed Korean/English)
- Extracted fields pre-fill the task creation form with confidence indicators
- Screenshot stored in Supabase Storage, linked to task, viewable as thumbnail
- Graceful fallback to manual entry for unreadable screenshots
- Basic per-user rate limiting (10/hour)

This phase does NOT include: batch upload, OCR for non-KakaoTalk sources, automatic task creation without review, or task filtering/search.

</domain>

<decisions>
## Implementation Decisions

### Upload Interaction
- **D-01:** Dedicated **"Upload Screenshot" option inside a '+' dropdown** in the header. The existing '+' create button becomes a dropdown with two options: "Upload Screenshot" and "Create Manually". One button, two paths.
- **D-02:** On mobile, upload supports **camera capture + gallery** selection. Uses `accept='image/*'` with capture attribute. Staff can photograph their phone screen or choose an existing screenshot.
- **D-03:** Loading state: **skeleton form** — open the task form immediately with skeleton/shimmer placeholders in each field. Fields fill in as extraction completes. Staff sees progress happening.

### Extraction Confidence UX
- **D-04:** Low-confidence fields get an **amber border + warning icon**. Tooltip on hover/tap: "AI extracted this — please verify". Only low-confidence fields are marked — high-confidence fields look normal (no extra indicators).
- **D-05:** Amber border matches the existing amber pattern from the offline banner (`amber-50`/`amber-800` palette).

### Error and Fallback Handling
- **D-06:** Completely unreadable screenshots: **open empty form with toast** — "Couldn't read the screenshot — please enter details manually." Staff can still create the task by hand.
- **D-07:** Partial extraction: **fill what we got, leave empty fields empty**. Low-confidence fields get amber indicator. Staff fills in the gaps. No special "not found" placeholders.
- **D-08:** API timeout or rate limit: **toast error + open empty form** — "Screenshot processing failed — please enter details manually." Never block task creation.

### Screenshot Preview
- **D-09:** **Collapsible preview above form** fields in the task dialog. Staff can expand to cross-reference while reviewing extracted data. Collapsed by default on mobile to save space.

### Screenshot Storage
- **D-10:** Screenshots stored in **Supabase Storage** in a `screenshots` bucket. Store the public URL in a new `screenshot_url` column on the tasks table.
- **D-11:** **Thumbnail on task row** — a small image icon/thumbnail on the task row indicating a screenshot is attached. Tapping opens the full image in a lightbox. Only shows for tasks that have a screenshot.

### Rate Limiting
- **D-12:** **Per-user, 10 screenshots per hour**. Simple in-memory counter on the server (resets on server restart — acceptable for 3-5 users).
- **D-13:** When rate limit is hit: **toast + open empty form** — "Screenshot limit reached — try again in a few minutes. You can still create the task manually."

### Image Constraints
- **D-14:** Accept PNG, JPEG, HEIC, WebP. **Max 10MB**. Client-side resize to max 2048px on longest edge before sending to server. Reduces upload time and API cost.

### Upload Button Placement
- **D-15:** The '+' button in the header becomes a **dropdown menu** with two options: "Upload Screenshot" (camera icon) and "Create Manually" (edit icon). Single entry point, two paths.

### Claude's Discretion
- Claude vision API prompt engineering (exact prompt text, extraction format)
- Confidence threshold values (what score = "low confidence")
- Image compression library choice (browser-image-compression, canvas API, etc.)
- Supabase Storage bucket configuration (public vs signed URLs, file naming)
- Skeleton shimmer animation implementation details
- Lightbox component choice (existing shadcn dialog or dedicated lightbox)
- DB migration details for `screenshot_url` column and Storage bucket policies

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Project vision, constraints (Claude API for OCR, mixed Korean/English screenshots)
- `.planning/REQUIREMENTS.md` — Phase 3 req IDs: AI-01, AI-02, AI-03, AI-04, AI-05
- `.planning/STATE.md` — Current progress and tech stack decisions

### Prior Phase Context
- `.planning/phases/01-foundation-core-board/01-CONTEXT.md` — Board layout, task form, database schema decisions
- `.planning/phases/02-pwa-push-notifications/02-CONTEXT.md` — Push notification and PWA decisions

### Conventions & Stack
- `.planning/codebase/CONVENTIONS.md` — Naming patterns, TanStack Start patterns, Supabase patterns
- `.planning/codebase/STACK.md` — Claude API via `@anthropic-ai/sdk`, `createServerFn` pattern
- `.planning/codebase/INTEGRATIONS.md` — Supabase integration points

### Roadmap
- `.planning/ROADMAP.md` — Phase 3 deliverables and requirement mapping

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/components/TaskForm.tsx` — Existing task form with react-hook-form + zod validation; AI extraction maps to `createTaskSchema` fields (client_name, phone, service, preferred_datetime, notes, request_type)
- `app/lib/schemas.ts` — Zod schemas for task CRUD; extend `createTaskSchema` or create new schema for AI extraction response
- `app/server/tasks.ts` — `createServerFn` pattern for server functions; screenshot handler follows same pattern
- `app/components/ui/dialog.tsx` — shadcn Dialog component used by TaskForm; reuse for upload/preview
- `app/components/ui/dropdown-menu.tsx` — shadcn DropdownMenu used by UserMenu; reuse for '+' button dropdown

### Established Patterns
- `createServerFn` with Zod validation for all server-side logic
- `getSupabaseServerClient(request.headers)` for authenticated Supabase access
- Tailwind CSS with `cn()` helper for conditional styling
- Dialog-based forms (TaskForm pattern)
- Toast/banner pattern from Phase 2 (offline banner, push permission card)

### Integration Points
- `app/components/Header.tsx` — '+' create button becomes dropdown here
- `app/routes/_auth/index.tsx` — Board page; upload flow triggers from here
- `supabase/migrations/` — New migration for `screenshot_url` column + Storage bucket
- `app/lib/database.types.ts` — Update with `screenshot_url` field on tasks table
- `app/components/TaskRow.tsx` — Add screenshot thumbnail indicator

</code_context>

<specifics>
## Specific Ideas

- KakaoTalk screenshots contain mixed Korean/English text, call metadata, timestamps, and contact names. The Claude prompt must handle this bilingual extraction reliably.
- Staff use this 5-15 times/day — the upload flow must be fast and forgiving. Never block task creation if AI fails.
- The skeleton form pattern (D-03) means the task form dialog opens instantly — this feels faster than waiting for extraction to complete before showing anything.
- HEIC support is important because iPhone cameras default to HEIC format. Client-side conversion to JPEG before upload handles this.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 3 scope.

</deferred>

---

*Phase: 03-ai-screenshot-processing*
*Context gathered: 2026-04-03*

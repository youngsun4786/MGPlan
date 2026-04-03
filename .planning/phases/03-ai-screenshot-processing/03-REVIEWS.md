---
phase: 03
reviewers: [gemini, claude]
reviewed_at: 2026-04-03T12:00:00Z
plans_reviewed: [03-01-PLAN.md, 03-02-PLAN.md, 03-03-PLAN.md]
---

# Cross-AI Plan Review — Phase 3

## Gemini Review

The implementation plans for Phase 3 are **exceptionally well-structured** and align perfectly with the "simplicity over scale" mantra of the project. The decision to open the task form immediately with skeleton states (D-03) provides a premium UX feel that masks the latency of the Claude Vision API. The plans demonstrate a deep understanding of the existing TanStack Start + Supabase architecture.

### Strengths
- **Superior UX Design**: The "Skeleton Form" pattern (Plan 02, Task 2) ensures zero perceived lag when the user taps "Upload Screenshot," fulfilling the "native feel" goal of the PWA.
- **Robust Error Handling**: The "fail-open" strategy (D-06, D-08) is correctly prioritized—if the AI fails, the manual form is always the fallback, ensuring staff are never blocked from logging a lead.
- **Technical Pragmatism**: Using `browser-image-compression` to handle HEIC-to-JPEG conversion client-side (Plan 01, Task 1) solves the "iPhone upload" pitfall before it reaches the server, saving tokens and bandwidth.
- **Thoughtful Prompt Engineering**: The prompt includes specific Korean phone number formats (010-XXXX-XXXX) and instructions for mixed-language extraction, which is critical for the KakaoTalk workflow.
- **Clean Integration**: Adding the `screenshot_url` to the existing `createTask` flow rather than creating a separate "ScreenshotTask" entity keeps the database schema simple and maintainable.

### Concerns
- **Vercel Timeout Risk (HIGH)**: On the Vercel Hobby plan, serverless functions have a 10-second timeout. The `processScreenshot` function (Plan 01, Task 2) performs a Claude Vision API call *and* a Supabase Storage upload sequentially. Claude Vision can take 3-8 seconds alone.
  - *Risk*: A large image or slow API response could trigger a 504 Gateway Timeout.
- **Storage Privacy (MEDIUM)**: The migration (Plan 01, Task 1) sets the `screenshots` bucket to `public`. While UUID filenames provide "security by obscurity," screenshots of personal messages (KakaoTalk) might contain sensitive info.
  - *Risk*: If a URL is leaked, anyone can view the screenshot without authentication.
- **State Management on Refresh (LOW)**: If the user refreshes the page while the skeleton form is "Processing," the state (`isExtracting`, `extractedData`) will be lost. Since this is a temporary modal state, the impact is minimal.

### Suggestions
- **Sequential to Parallel**: In `app/server/screenshot.ts`, consider starting the Supabase Storage upload and the Claude API call in parallel (`Promise.all`) once the image buffer is ready. This would significantly reduce the risk of Vercel timeouts.
- **Authenticated Read Policy**: Change the `screenshots` bucket policy from `public` to `authenticated` for SELECT. Since all staff are logged in via Supabase Auth, they can still view the images, but the data is shielded from the open web.
- **Max Dimension Adjustment**: Plan 01 uses `MAX_DIMENSION = 1568`. This is the exact internal processing target for Claude 3.5 Sonnet. Keep this as is—it's more efficient than the 2048px mentioned in D-14.
- **Global Toaster**: Plan 02 adds the `<Toaster />` to the `BoardPage`. It might be better to move this to `app/routes/__root.tsx` (or verify it's already there) to handle toasts across the entire app, including login errors.

### Risk Assessment: MEDIUM
The overall risk is **Medium**, primarily due to the potential for **Vercel serverless timeouts**. The logic is sound and the dependencies are appropriate, but the sequential nature of two external API calls (Anthropic + Supabase) in a single request-response cycle is the primary bottleneck.

**Verdict**: The plans are ready for execution. The developer should monitor the latency of the `processScreenshot` function during the UAT phase (Plan 03) and consider the parallelization suggestion if timeouts occur.

---

## Claude Review

### Plan 03-01: Backend Pipeline

**Summary:** Solid backend plan that establishes all foundational contracts before UI work begins. The separation of types, server function, and client utilities is clean. The plan is detailed enough for autonomous execution with minimal ambiguity.

**Strengths:**
- Clear dependency chain: types → server function → tests
- Extraction prompt is well-crafted for the bilingual KakaoTalk use case
- Discriminated union `ExtractionResponse` makes error handling type-safe downstream
- Rate limiter is appropriately simple for 3-5 users (no over-engineering)
- JSON code fence stripping handles a real-world Claude output edge case
- HEIC-to-JPEG conversion happens client-side, avoiding server complexity

**Concerns:**
- **MEDIUM**: `screenshotInputSchema` uses `z.enum(['image/jpeg', 'image/png', 'image/webp'])` but `prepareImage` always converts to JPEG. The enum is broader than what's actually sent.
- **MEDIUM**: The `processScreenshot` handler uploads to Storage *after* extraction. If Vercel's 10s timeout is tight, the Storage upload could push it over.
- **LOW**: `Buffer.from(data.imageBase64, 'base64')` — `Buffer` is a Node.js global. Fine in Vercel serverless.
- **LOW**: No `DELETE` policy on `storage.objects` for the screenshots bucket. If a task with a screenshot is deleted, the image persists in Storage forever.
- **LOW**: Public Storage bucket — screenshot URLs are guessable if someone knows the bucket pattern.

**Suggestions:**
- Add a timeout to the `anthropic.messages.create` call (e.g., `timeout: 15000`) to fail fast
- Consider parallelizing Storage upload with Claude extraction
- The verification `grep` chain is brittle — consider checking exit codes individually

**Risk Assessment: LOW**

### Plan 03-02: UI Components + Wiring

**Summary:** The largest and most complex plan — creates 6 new components, modifies 3 existing ones, updates schemas and server functions. The component breakdown is clean and the UI-SPEC compliance is thorough. However, Task 2 modifies 5 files with significant changes.

**Strengths:**
- Component decomposition is excellent — each has a single responsibility
- `ConfidenceIndicator` correctly uses `aria-describedby` for accessibility
- Skeleton-to-populated field transition avoids layout shift
- `e.stopPropagation()` on thumbnail prevents row click interference
- Toast copy matches UI-SPEC exactly

**Concerns:**
- **HIGH**: Task 2 modifies `Header.tsx` to replace `onCreateTask` with new props, but Task 3 passes them. Between Tasks 2-3, the app breaks. Fine if executed sequentially, but fragile if interrupted.
- **HIGH**: `createTask` server function update is buried in Task 2 action text. If the insert doesn't include `screenshot_url`, it gets silently dropped. Promote to explicit acceptance criterion.
- **MEDIUM**: `window.innerWidth >= 640` for `ScreenshotPreview`'s `defaultOpen` isn't reactive to rotation.
- **MEDIUM**: TaskForm modifications are extensive without corresponding tests.
- **LOW**: `ImageLightbox` has no `DialogTitle` — may trigger accessibility warnings.
- **LOW**: `ScreenshotThumbnail` 20x20 icon inside 44x44 touch target — verify visibility.

**Suggestions:**
- Split Task 2 into component changes vs schema/server changes to reduce blast radius
- Add explicit acceptance criterion for `screenshot_url` in `createTask` insert and `fetchTasks` select
- Add a `VisuallyHidden` `DialogTitle` to `ImageLightbox`
- Consider adding a smoke test for TaskForm with `extractedData` prop
- Note `Toaster` placement for future root layout migration

**Risk Assessment: MEDIUM**

### Plan 03-03: Verification Checkpoint

**Summary:** A thorough manual test script covering happy path, error states, mobile, and regression. The right approach for visual/interaction-heavy features.

**Concerns:**
- **MEDIUM**: No guidance on verifying `ANTHROPIC_API_KEY` is set before testing
- **LOW**: No step to check Supabase Storage dashboard for persisted screenshots
- **LOW**: No rate limit testing guidance

**Suggestions:**
- Add step: verify `ANTHROPIC_API_KEY` is set
- Add step: check Supabase Storage bucket for uploaded screenshots
- Add optional rate limit test note

**Risk Assessment: LOW**

### Cross-Plan Assessment: **LOW-MEDIUM**
All requirements covered. Main risks: (1) Build breakage between Plan 02 Tasks 2-3, (2) TaskForm complexity without tests, (3) Vercel timeout if Claude + Storage >10s. None are blockers.

---

## Consensus Summary

### Agreed Strengths
- **Skeleton form UX** — both reviewers praised the instant-open skeleton pattern as excellent UX design
- **Fail-open error handling** — both noted the robust fallback to manual entry prevents staff from being blocked
- **Client-side HEIC-to-JPEG** — both recognized the pragmatism of handling conversion before server
- **Clean type contracts** — discriminated union `ExtractionResponse` praised for type safety
- **Appropriate simplicity** — rate limiter, schema design, and architecture match the 3-5 user scale

### Agreed Concerns
1. **Vercel timeout risk (HIGH)** — Both reviewers flagged the sequential Claude API call + Storage upload risking the 10s Vercel Hobby timeout. Both suggest parallelizing with `Promise.all`.
2. **Storage bucket privacy (MEDIUM)** — Both noted the public bucket is acceptable for v1 scale but flagged the risk. Gemini suggests `authenticated` read policy; Claude notes URLs are guessable.
3. **Plan 02 Task 2-3 build breakage (HIGH)** — Claude flagged that modifying Header props in Task 2 before wiring in Task 3 creates a broken intermediate state. Gemini didn't flag this but it's real for interrupted execution.
4. **`screenshot_url` in createTask buried in action text (HIGH)** — Claude flagged that the critical server function update is not an explicit acceptance criterion. Easy to miss during execution.
5. **TaskForm complexity without tests (MEDIUM)** — Claude flagged extensive TaskForm modifications without component-level tests. Gemini didn't mention this specifically but flagged the overall plan density.

### Divergent Views
- **Overall risk**: Gemini rates overall MEDIUM (weighted toward timeout risk), Claude rates LOW-MEDIUM (timeout mitigated by compression)
- **Toaster placement**: Both note it should be in root layout eventually; neither considers it blocking
- **`screenshotInputSchema` enum breadth**: Only Claude flagged the JPEG-only mismatch with the broader enum. Gemini didn't mention it.
- **DialogTitle accessibility**: Only Claude flagged the missing `DialogTitle` in `ImageLightbox`

---
phase: 03-ai-screenshot-processing
plan: 02
subsystem: ui, api
tags: [screenshot-upload, confidence-indicator, skeleton-loading, lightbox, dropdown-menu, collapsible, sonner-toast]

# Dependency graph
requires:
  - phase: 03-ai-screenshot-processing
    plan: 01
    provides: processScreenshot server function, ExtractionResult types, image-utils, screenshot_url DB column
  - phase: 01-foundation
    provides: TaskForm, Header, TaskRow, TaskBoard, schemas, server functions
provides:
  - ScreenshotUploadDropdown component replacing plain + button
  - ConfidenceIndicator for low-confidence AI-extracted fields
  - SkeletonFormField for loading state during extraction
  - ScreenshotPreview collapsible image viewer above form
  - ScreenshotThumbnail and ImageLightbox for task row
  - Full upload-to-form flow wired in board page
  - screenshot_url persisted in createTask and returned by fetchTasks
affects: [03-03-realtime-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Skeleton loading state for AI extraction", "Confidence indicator with amber border + tooltip", "Hidden file input triggered by dropdown menu", "State clearing on dialog close for screenshot data"]

key-files:
  created:
    - app/components/ScreenshotUploadDropdown.tsx
    - app/components/ConfidenceIndicator.tsx
    - app/components/SkeletonFormField.tsx
    - app/components/ScreenshotPreview.tsx
    - app/components/ScreenshotThumbnail.tsx
    - app/components/ImageLightbox.tsx
  modified:
    - app/components/Header.tsx
    - app/components/TaskForm.tsx
    - app/components/TaskRow.tsx
    - app/lib/schemas.ts
    - app/server/tasks.ts
    - app/routes/_auth/index.tsx
    - tests/components/TaskForm.test.tsx

key-decisions:
  - "ConfidenceIndicator uses CSS class selector pattern ([&_input]:border-amber-400) to style child form elements without prop drilling"
  - "ScreenshotPreview uses controlled state to track open/closed for text toggle (View/Hide Screenshot)"
  - "Hidden file input with capture=environment for mobile camera access, triggered programmatically from dropdown"

patterns-established:
  - "Skeleton-to-content transition: isExtracting flag swaps SkeletonFormField components for real form fields"
  - "Confidence CSS class: .confidence-low applied as marker class for test assertions"

requirements-completed: [AI-01, AI-03, AI-04, AI-05]

# Metrics
duration: 6min
completed: 2026-04-03
---

# Phase 3 Plan 2: Screenshot Upload UI Summary

**Complete screenshot upload flow with dropdown menu, skeleton loading, confidence indicators, collapsible preview, and task row thumbnails with lightbox**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-03T20:42:24Z
- **Completed:** 2026-04-03T20:48:51Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments
- Built 6 new UI components: ScreenshotUploadDropdown, ConfidenceIndicator, SkeletonFormField, ScreenshotPreview, ScreenshotThumbnail, ImageLightbox
- Wired complete upload flow in board page: file input, validation, AI extraction, form pre-fill, toast error handling
- Modified Header (dropdown), TaskForm (skeleton/confidence/preview), TaskRow (thumbnail/lightbox) to support screenshot workflow
- Added screenshot_url to createTask schema, INSERT, and fetchTasks SELECT
- 12 passing tests covering skeleton state, pre-fill, confidence indicators, and button states

## Task Commits

Each task was committed atomically:

1. **Task 1: Create 6 new UI components** - `fffb39b` (feat)
2. **Task 2: Modify Header, TaskForm, TaskRow, schemas, server, and wire board page** - `80ddc47` (feat)
3. **Task 3: Component smoke tests for TaskForm with extraction data** - `29187c6` (test)

## Files Created/Modified
- `app/components/ScreenshotUploadDropdown.tsx` - Dropdown menu with Upload Screenshot and Create Manually items
- `app/components/ConfidenceIndicator.tsx` - Amber border + AlertTriangle tooltip for low-confidence fields
- `app/components/SkeletonFormField.tsx` - Skeleton shimmer placeholder for form fields during extraction
- `app/components/ScreenshotPreview.tsx` - Collapsible image preview above form using shadcn Collapsible
- `app/components/ScreenshotThumbnail.tsx` - Image icon button on TaskRow with 44px touch target
- `app/components/ImageLightbox.tsx` - Full-size screenshot dialog with sr-only DialogTitle for accessibility
- `app/components/Header.tsx` - Replaced plain Button with ScreenshotUploadDropdown
- `app/components/TaskForm.tsx` - Added extractedData/screenshotUrl/isExtracting props with skeleton/confidence/preview
- `app/components/TaskRow.tsx` - Added ScreenshotThumbnail and ImageLightbox
- `app/lib/schemas.ts` - Added screenshot_url to createTaskSchema
- `app/server/tasks.ts` - Added screenshot_url to INSERT and SELECT
- `app/routes/_auth/index.tsx` - Wired full upload flow with processScreenshot, validation, toast, file input
- `tests/components/TaskForm.test.tsx` - Added 5 screenshot integration tests

## Decisions Made
- ConfidenceIndicator uses CSS descendant selector pattern to style child inputs without prop drilling
- ScreenshotPreview tracks open state internally for text toggle between "View Screenshot" and "Hide Screenshot"
- Hidden file input with capture="environment" for mobile camera access, triggered by dropdown menu click

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - all functionality is fully wired to the processScreenshot server function from Plan 01.

## Next Phase Readiness
- Upload flow complete and ready for end-to-end testing
- Realtime integration (Plan 03) can build on top of this without modifications
- All error paths (unreadable, timeout, rate limit, invalid file) produce toast messages and fall back to manual entry

## Self-Check: PASSED

All 6 created files verified present. All 3 task commits verified in git log.

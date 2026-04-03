# Phase 3: AI Screenshot Processing - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-03
**Phase:** 03-ai-screenshot-processing
**Areas discussed:** Upload interaction, Extraction confidence UX, Error and fallback handling, Screenshot preview, Rate limiting strategy, Image size and format limits, Upload button placement, Screenshot storage

---

## Upload Interaction

### How to trigger upload

| Option | Description | Selected |
|--------|-------------|----------|
| Separate upload button | Dedicated button on board next to '+' create button. | |
| Inside the task form | Upload zone inside existing task creation dialog. | |
| Both — button + form zone | Two entry points for same flow. | |

**User's choice:** Separate upload button (Recommended)
**Notes:** Later revised to dropdown inside '+' button (see Upload Button Placement)

### Camera capture on mobile

| Option | Description | Selected |
|--------|-------------|----------|
| Camera + gallery | Both options: take photo or choose from gallery. | ✓ |
| Gallery only | Only existing images from photo library. | |

**User's choice:** Camera + gallery (Recommended)

### Loading state during processing

| Option | Description | Selected |
|--------|-------------|----------|
| Skeleton form | Open form immediately with shimmer placeholders. | ✓ |
| Processing dialog | Separate dialog with spinner. | |
| Inline on board | Loading indicator on board, form opens when ready. | |

**User's choice:** Skeleton form (Recommended)

---

## Extraction Confidence UX

### Low-confidence field indicator

| Option | Description | Selected |
|--------|-------------|----------|
| Amber border + icon | Amber/yellow border with warning icon. Tooltip on hover/tap. | ✓ |
| Highlight background | Light yellow background tint. | |
| Inline text label | Small 'Needs review' text below field. | |

**User's choice:** Amber border + icon (Recommended)

### Which fields to mark

| Option | Description | Selected |
|--------|-------------|----------|
| Only low-confidence | High-confidence fields look normal. Only uncertain fields highlighted. | ✓ |
| All extracted fields | Every AI-filled field has indicator. Low-confidence gets stronger treatment. | |

**User's choice:** Only low-confidence (Recommended)

---

## Error and Fallback Handling

### Completely unreadable screenshot

| Option | Description | Selected |
|--------|-------------|----------|
| Open empty form with message | Toast message + empty form. Staff enters manually. | ✓ |
| Stay in upload with retry | Error in upload dialog with retry + skip buttons. | |
| Auto-retry then fallback | Retry once automatically, then empty form. | |

**User's choice:** Open empty form with message (Recommended)

### Partial extraction

| Option | Description | Selected |
|--------|-------------|----------|
| Fill what we got, flag the rest | Pre-fill extracted fields. Leave empty fields empty. Low-confidence gets amber. | ✓ |
| Fill what we got, flag empty as 'not found' | Empty fields get 'Not found in screenshot' placeholder + amber border. | |

**User's choice:** Fill what we got, flag the rest (Recommended)

### API timeout or rate limit

| Option | Description | Selected |
|--------|-------------|----------|
| Toast error + open empty form | Error toast + empty form. Never block task creation. | ✓ |
| Auto-retry once then fallback | Retry once, then toast + empty form. | |

**User's choice:** Toast error + open empty form (Recommended)

---

## Screenshot Preview

### Visibility during review

| Option | Description | Selected |
|--------|-------------|----------|
| Collapsible preview above form | Thumbnail above form, collapsible. Collapsed by default on mobile. | ✓ |
| Side-by-side desktop, stacked mobile | Split view layout. | |
| Hidden after extraction | Don't show screenshot in form view. | |
| Lightbox on tap | Small thumbnail icon, tap for full-screen overlay. | |

**User's choice:** Collapsible preview above form (Recommended)

---

## Rate Limiting Strategy

### Rate limit approach

| Option | Description | Selected |
|--------|-------------|----------|
| Per-user, 10/hour | Each staff 10 screenshots/hour. In-memory counter. | ✓ |
| Per-user, 5/hour | More conservative. | |
| Global, 30/hour | Shared limit across all staff. | |

**User's choice:** Per-user, 10/hour (Recommended)

### Rate limit message

| Option | Description | Selected |
|--------|-------------|----------|
| Toast + open empty form | Error message + empty form so work isn't blocked. | ✓ |
| Toast only, no form | Just a toast, staff manually clicks Create Task. | |

**User's choice:** Toast + open empty form (Recommended)

---

## Image Size and Format Limits

### Image constraints

| Option | Description | Selected |
|--------|-------------|----------|
| 10MB max, compress before upload | Accept PNG/JPEG/HEIC/WebP. Client-side resize to 2048px. | ✓ |
| 5MB max, no compression | Strict limit, reject larger files. | |
| 20MB max, server-side compress | Accept large files, compress on server. | |

**User's choice:** 10MB max, compress before upload (Recommended)

---

## Upload Button Placement

### Button location

| Option | Description | Selected |
|--------|-------------|----------|
| Next to '+' in header | Separate camera icon button next to create button. | |
| Inside '+' as dropdown | '+' becomes dropdown: "Upload Screenshot" + "Create Manually". | ✓ |
| Floating action button | Camera FAB on mobile, header button on desktop. | |

**User's choice:** Inside '+' as dropdown

---

## Screenshot Storage

### Storage location

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase Storage bucket | Upload to 'screenshots' bucket. Store URL in `screenshot_url` column. | ✓ |
| Base64 in database | Encode as base64 in TEXT column. | |

**User's choice:** Supabase Storage bucket (Recommended)

### Display on task view

| Option | Description | Selected |
|--------|-------------|----------|
| Thumbnail on task row | Small image icon/thumbnail. Tap for full image lightbox. | ✓ |
| Always visible in detail | Full screenshot always shown above form when editing. | |
| Expandable in row | Expand button reveals screenshot inline below task. | |

**User's choice:** Thumbnail on task row (Recommended)

---

## Claude's Discretion

- Claude vision API prompt engineering
- Confidence threshold values
- Image compression library choice
- Supabase Storage bucket configuration
- Skeleton shimmer animation
- Lightbox component
- DB migration details

## Deferred Ideas

None — discussion stayed within phase scope.

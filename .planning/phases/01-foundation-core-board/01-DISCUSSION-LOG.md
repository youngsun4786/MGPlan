# Phase 1: Foundation & Core Board - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 01-foundation-core-board
**Areas discussed:** Board layout, DB schema design, Auth UX

---

## Board Layout

### Display style

| Option | Description | Selected |
|--------|-------------|----------|
| List — scrollable feed | Simple vertical list, newest first. Status as colored badge. Fast to scan on mobile. | ✓ |
| Card grid | 1-2 column grid, more visual. More info per card. | |
| Kanban columns by status | Open/In Progress/Done side-by-side. Horizontal scroll on mobile. | |

**User's choice:** List — all tasks in one scrollable feed

---

### Info per task row

| Option | Description | Selected |
|--------|-------------|----------|
| Client name + phone + request type + status | The 4 actionable fields. | ✓ |
| All fields visible | Client name, phone, service, date, notes, status. Dense on mobile. | |
| Client name + request type + status only | Minimal — phone hidden until tapped. | |

**User's choice:** Client name + phone + request type + status (Recommended)

---

### Default sort order

| Option | Description | Selected |
|--------|-------------|----------|
| Newest first | Most recent calls at top. | |
| Oldest first — FIFO queue | Earliest unhandled tasks surface first. | ✓ |
| Status grouped | Open first, then In Progress, then Done. | |

**User's choice:** Oldest first — FIFO queue

---

### Done tasks visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Stay visible but visually dimmed | Remain in list with reduced opacity/strikethrough. | ✓ |
| Hidden by default, toggle to show | Board stays clean — flip switch to see Done tasks. | |
| Auto-archive after 24h | Disappear from main board next day. | |

**User's choice:** Stay visible but visually dimmed (Recommended)

---

## DB Schema Design

### Staff profiles

| Option | Description | Selected |
|--------|-------------|----------|
| `staff` table mirroring auth.users | id (FK), display_name, email. Tasks FK to staff for names. Standard Supabase pattern. | ✓ |
| Auth users only — no staff table | Simpler. Display names from auth metadata. | |

**User's choice:** `staff` table mirroring auth.users (Recommended)

---

### Status / request_type storage

| Option | Description | Selected |
|--------|-------------|----------|
| Postgres enums | Type-safe at DB level, auto-generates TypeScript types via Supabase CLI. | ✓ |
| Text + CHECK constraint | Easier to extend later without migration. | |
| Text — no constraint | Maximum flexibility, validation in app only. | |

**User's choice:** Postgres enums (Recommended)

---

### preferred_datetime storage

| Option | Description | Selected |
|--------|-------------|----------|
| Single TIMESTAMPTZ column | Nullable — NULL means ASAP. Simple. | ✓ |
| Text field for flexibility | Preserves fuzzy times like "Tuesday afternoon". | |
| Both — TIMESTAMPTZ + text note | Structured + freeform. More complex. | |

**User's choice:** Single TIMESTAMPTZ column (Recommended)

---

### RLS edit policy

| Option | Description | Selected |
|--------|-------------|----------|
| Any authenticated staff can edit any task | Flat team model — INSERT/UPDATE/DELETE for all. | ✓ |
| Staff can only edit tasks they created | Ownership model — others read-only. | |

**User's choice:** Any authenticated staff can edit any task (Recommended)

---

## Auth UX

### Login page feel

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal centered card | App name/logo, email, password, submit. Clean. | ✓ |
| Full-screen with branding | Background + prominently displayed shop name. More work. | |
| You decide | Claude picks minimal approach. | |

**User's choice:** Minimal centered card (Recommended)

---

### After login redirect

| Option | Description | Selected |
|--------|-------------|----------|
| Directly to task board | Login → board instantly. | ✓ |
| Brief welcome / loading screen | App name shown 1-2s before board. | |
| You decide | Claude picks based on TanStack Start routing. | |

**User's choice:** Directly to the task board (Recommended)

---

### Session expiry behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Redirect to /login with message | Next auth-required action redirects with "Your session expired." | ✓ |
| Silent re-auth attempt, then redirect | Refresh session silently first. More complex. | |
| You decide | Claude picks what Supabase handles naturally. | |

**User's choice:** Redirect to login page with a message (Recommended)

---

### Login error message

| Option | Description | Selected |
|--------|-------------|----------|
| Generic: "Invalid email or password" | Doesn't confirm whether email exists. | ✓ |
| Specific: "Password incorrect" / "Email not found" | More helpful but confirms account existence. | |

**User's choice:** Generic: "Invalid email or password" (Recommended)

---

### Sign out location

| Option | Description | Selected |
|--------|-------------|----------|
| Top-right avatar icon → dropdown | Initials or avatar opens menu with Sign Out. | ✓ |
| Always-visible header button | Easier to find, takes header space. | |
| You decide | Claude picks for minimal header. | |

**User's choice:** Top-right menu / avatar icon (Recommended)

---

## Claude's Discretion

- Task form layout details (field ordering, modal vs inline)
- Empty state design for board when no tasks exist
- Loading skeleton vs spinner
- Exact Tailwind color tokens for status badges
- Task edit interaction pattern

## Deferred Ideas

None.

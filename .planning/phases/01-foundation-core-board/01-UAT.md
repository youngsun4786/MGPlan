---
status: complete
phase: 01-foundation-core-board
source: [01-01-SUMMARY.md, 01-03-SUMMARY.md, 01-04-SUMMARY.md, 01-02-PLAN.md, 01-05-PLAN.md]
started: 2026-04-01T21:30:00Z
updated: 2026-04-01T21:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server. Run `npm run dev`. Server boots without errors. Visit http://localhost:3000 — page loads (redirects to /login since not authenticated).
result: pass
notes: Server boots in 920ms, HTTP 307 redirect to /login. Non-blocking SSR warning about supabase.client.ts import in login.tsx (cosmetic, app still works).

### 2. Login Page Renders
expected: Navigate to /login. See a minimal centered card with email input, password input, and "Sign In" button. No navigation bar — just the card on a clean background.
result: pass

### 3. Login with Valid Credentials
expected: Enter a valid staff email and password. Click "Sign In". Redirected to the task board (/ route). Header shows app name and user avatar/initials dropdown.
result: pass
notes: Required fixes — staff table fallback for Dashboard-created users, supabase.server.ts cookie setAll, supabase.browser.ts rename. Board loads with header, Create Task button, Y avatar, empty state.

### 4. Login Error Message
expected: Enter wrong email or password. Click "Sign In". See "Invalid email or password" error message below the form. No user enumeration — same message for wrong email vs wrong password.
result: pass

### 5. Protected Route Redirect
expected: Log out (or open incognito). Navigate directly to /. Redirected to /login. No flash of board content.
result: pass

### 6. Session Persists Across Refresh
expected: While logged in, refresh the page (Cmd+R). Still logged in — board loads without showing login page.
result: pass

### 7. Sign Out
expected: Click avatar/initials in the top-right header. Dropdown appears with "Sign Out" option. Click it. Redirected to /login.
result: pass
notes: Required fix — Base UI needs DropdownMenuGroup wrapper around GroupLabel/Separator.

### 8. Create Task
expected: Click "Create Task" button in header. Dialog opens with fields: client name, phone, service, preferred date/time, notes, request type (dropdown with New Booking / Change Request options). Fill all fields. Click "Save" or submit. Dialog closes. New task appears in the list.
result: pass
notes: Required fixes — ensureStaffRecord helper + RLS INSERT policy for staff table.

### 9. Form Validation
expected: Open Create Task dialog. Leave client name empty. Try to submit. See field-level error message. Same for empty phone number. Whitespace-only input should also be rejected.
result: pass

### 10. Task Board Shows All Tasks
expected: After creating tasks, the board shows all tasks in a single scrollable list (not cards, not kanban). Tasks sorted oldest first (FIFO). Each row shows: client name, phone number, request type, and status badge.
result: pass

### 11. Status Cycling
expected: Click the status badge on a task. Status cycles: Open → In Progress → Done. Badge color changes (amber → blue → gray). Change is immediate (optimistic update).
result: pass

### 12. Done Tasks Dimmed
expected: After marking a task "Done", the row stays visible but appears dimmed (reduced opacity). Not hidden, not removed.
result: issue
reported: "it doesn't appear that dimmed"
severity: cosmetic

### 13. Edit Task
expected: Click on a task row (not the badge). Edit dialog opens pre-filled with task data. Change a field. Save. Dialog closes. Updated values appear in the list.
result: pass

### 14. Delete Task
expected: In edit mode, click delete. Confirmation dialog shows "Delete Task" (red) and "Keep Task" buttons. Click "Delete Task". Task removed from list.
result: pass

### 15. Realtime Updates
expected: Open the app in two browser windows (same account or different). Create a task in one window. The task appears in the other window within 2 seconds — no manual refresh needed.
result: pass

### 16. Responsive Layout
expected: Resize browser to mobile width (~375px). Layout adjusts — task rows remain readable, touch targets are large enough to tap, "Create Task" button is accessible. No horizontal scrolling.
result: pass

## Summary

total: 16
passed: 15
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Done tasks appear visually dimmed with reduced opacity"
  status: failed
  reason: "User reported: it doesn't appear that dimmed"
  severity: cosmetic
  test: 12
  artifacts: [app/components/TaskRow.tsx]
  missing: []

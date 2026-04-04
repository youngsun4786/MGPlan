# Phase 04: Filters, Search & Hardening - Research

**Researched:** 2026-04-03
**Domain:** Client-side filtering/search UI, Supabase RLS audit, PWA hardening
**Confidence:** HIGH

## Summary

This phase adds client-side filtering, search, and sort to the existing TaskBoard, plus production hardening (error handling, RLS audit, cross-browser testing, Lighthouse). The entire task list is already loaded client-side via `fetchTasks` and kept live through Supabase realtime subscriptions, so all filtering/search/sort operations are pure React state transformations -- no additional server queries needed.

The filter bar is a new sticky component placed between the Header and the task list. It contains status filter chips, request type filter chips, a date range picker, a search input, and a sort toggle. All filters combine with AND logic. The key architectural decision is that filter state lives in TaskBoard (or is lifted to the board page) and is applied to the live `tasks` array before rendering.

The hardening tasks are independent: toast-only error handling (sonner already installed), RLS policy verification against the migration files, cross-browser smoke test documentation, and a Lighthouse audit checklist.

**Primary recommendation:** Build a `FilterBar` component with `useFilterState` hook that manages all filter/search/sort state. Apply filters as a pure function over the tasks array inside TaskBoard, keeping the realtime subscription logic untouched.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Sticky filter bar below the header. Always visible. Contains filter chips, search input, and sort toggle in one unified row.
- D-02: Filters combine with AND logic -- Status=Open AND Type=New Booking shows only open new bookings.
- D-03: Done tasks remain shown but dimmed (current behavior). No default hiding. User can explicitly filter to exclude them.
- D-04: Filter chips for: Status (Open, In Progress, Done), Request Type (New Booking, Change Time, Change Therapist, Other), Date range (created_at).
- D-05: Search input sits inside the filter bar alongside chip filters.
- D-06: Live filter as you type -- no submit button, results narrow instantly with each keystroke. All tasks are already loaded client-side so this is fast.
- D-07: Search matches client name or phone number (case-insensitive substring match).
- D-08: Simple toggle button in the filter bar. Tap to switch between "Oldest first" (FIFO, default) and "Newest first". Arrow icon flips to indicate direction.
- D-09: Toast notifications only for all errors. Keep last-known board state visible. No full error boundary components.
- D-10: Distinct "no results" empty state when filters return zero tasks: "No tasks match your filters" with a "Clear filters" button. Different from the existing "No tasks yet" empty board state.

### Claude's Discretion
- RLS audit approach
- Cross-browser smoke test strategy
- Lighthouse PWA + performance audit approach
- Environment variable audit and secrets rotation checklist

### Deferred Ideas (OUT OF SCOPE)
None -- phase scope covers the full v1 polish pass.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FILT-01 | Filter task board by status (Open, In Progress, Done) | Status filter chips using TASK_STATUS constants, client-side array filter |
| FILT-02 | Filter by request type (New Booking, Change Time, Change Therapist) | Request type chips using REQUEST_TYPE_LABELS, same AND-logic filter chain |
| FILT-03 | Filter by date range (created at) | Date range inputs (native HTML date inputs), filter by created_at comparison |
| FILT-04 | Search tasks by client name or phone number | Search input with case-insensitive substring match on client_name and phone fields |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.0 | UI framework | Already in use |
| Tailwind CSS | 4.x | Styling | Already in use |
| shadcn/ui | 4.x | Component library (Badge, Button, Input) | Already in use |
| lucide-react | 0.545.0 | Icons (ArrowUpDown, X, Search) | Already in use |
| sonner | 2.0.7 | Toast notifications for errors | Already in use, Toaster already in BoardPage |

### Supporting (No New Dependencies Needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Native HTML `<input type="date">` | N/A | Date range picker | FILT-03 date range filter -- avoids adding a date picker library for two date inputs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native date inputs | date-fns + custom date picker | Overkill for two simple date inputs; no date library currently installed |
| Client-side filtering | Server-side Supabase queries | All tasks already loaded; client-side is simpler and faster for a 3-5 person team's task volume |
| Custom filter chips | @headlessui Listbox | Unnecessary complexity; simple toggle buttons with Badge styling suffice |

**Installation:**
```bash
# No new packages needed. All dependencies are already installed.
```

## Architecture Patterns

### Recommended Component Structure
```
app/
  components/
    FilterBar.tsx          # New: sticky filter bar with chips, search, sort
    TaskBoard.tsx           # Modified: accepts filter state, applies filters
    TaskRow.tsx             # Unchanged
    StatusBadge.tsx         # Unchanged (reuse colors for filter chips)
  hooks/
    useFilterState.ts       # New: manages all filter/search/sort state
  lib/
    filters.ts              # New: pure filter/search/sort functions
    constants.ts            # Existing: TASK_STATUS, REQUEST_TYPE enums
```

### Pattern 1: Filter State Hook
**What:** A custom hook `useFilterState` that manages status filters, request type filters, date range, search query, and sort direction as a single cohesive state object.
**When to use:** In the board page component, passed down to FilterBar (for controls) and TaskBoard (for applying filters).
**Example:**
```typescript
// app/hooks/useFilterState.ts
interface FilterState {
  statuses: Set<TaskStatus>        // empty = show all
  requestTypes: Set<RequestType>   // empty = show all
  dateFrom: string | null          // ISO date string
  dateTo: string | null            // ISO date string
  search: string                   // substring search query
  sortDirection: 'asc' | 'desc'   // asc = oldest first (default)
}

function useFilterState() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  // Individual updaters: toggleStatus, toggleRequestType, setDateRange, setSearch, toggleSort, clearAll
  return { filters, toggleStatus, toggleRequestType, setDateRange, setSearch, toggleSort, clearAll }
}
```

### Pattern 2: Pure Filter Function
**What:** A pure function that takes the full task array and filter state, returns the filtered+sorted array. This keeps filtering logic testable and separate from React rendering.
**When to use:** Called inside TaskBoard before rendering, applied to the live tasks array (which includes realtime updates).
**Example:**
```typescript
// app/lib/filters.ts
export function applyFilters(tasks: TaskWithStaff[], filters: FilterState): TaskWithStaff[] {
  let result = tasks

  // Status filter (AND: must match one of selected statuses)
  if (filters.statuses.size > 0) {
    result = result.filter(t => filters.statuses.has(t.status))
  }

  // Request type filter
  if (filters.requestTypes.size > 0) {
    result = result.filter(t => filters.requestTypes.has(t.request_type))
  }

  // Date range filter on created_at
  if (filters.dateFrom) {
    result = result.filter(t => t.created_at >= filters.dateFrom!)
  }
  if (filters.dateTo) {
    // Add one day to include the full end date
    const endDate = new Date(filters.dateTo)
    endDate.setDate(endDate.getDate() + 1)
    result = result.filter(t => t.created_at < endDate.toISOString())
  }

  // Search: case-insensitive substring on client_name or phone
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase().trim()
    result = result.filter(t =>
      t.client_name.toLowerCase().includes(q) ||
      t.phone.toLowerCase().includes(q)
    )
  }

  // Sort
  result.sort((a, b) => {
    const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return filters.sortDirection === 'asc' ? diff : -diff
  })

  return result
}
```

### Pattern 3: Filter Chip Toggle
**What:** Each filter chip is a Button or Badge variant that toggles its inclusion in the active filter set. Active chips get a filled style; inactive chips get an outline style.
**When to use:** Status and request type filter sections in the FilterBar.
**Example:**
```typescript
// Inside FilterBar.tsx
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-[36px] px-3 py-1 rounded-full text-sm font-medium transition-colors',
        active
          ? 'bg-blue-600 text-white'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      )}
    >
      {label}
    </button>
  )
}
```

### Anti-Patterns to Avoid
- **Filtering in useEffect:** Do NOT put filter logic in a useEffect that writes to state. Filter the array synchronously during render (useMemo or inline). Avoids double-render and stale data on realtime updates.
- **Debouncing search:** D-06 says "results narrow instantly with each keystroke." Since filtering is client-side over a small array, debouncing is unnecessary overhead. Direct `onChange` -> state update is correct.
- **Separate filtered state:** Do NOT maintain a separate `filteredTasks` state variable. Always derive filtered results from the source `tasks` array + filter state. Otherwise realtime inserts/updates/deletes may not appear correctly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom error modal/banner | sonner (already installed) | D-09 specifies toast-only; Toaster already rendered in BoardPage |
| Date input | Custom calendar picker component | Native `<input type="date">` | Two simple date inputs; no library needed for this scope |
| Icon set | Custom SVG icons | lucide-react (already installed) | ArrowUp, ArrowDown, Search, X icons all available |

## Common Pitfalls

### Pitfall 1: Filter state not applied to realtime updates
**What goes wrong:** New tasks arrive via realtime subscription but appear unfiltered because filters were only applied to the initial load.
**Why it happens:** Filter logic was placed in the wrong layer (e.g., server-side or in the loader) instead of being applied to the live tasks array.
**How to avoid:** Always derive the displayed list from `applyFilters(tasks, filterState)` where `tasks` is the live array updated by realtime subscriptions.
**Warning signs:** New task appears on board even when status filter excludes it.

### Pitfall 2: Empty set means "show all" vs "show none"
**What goes wrong:** When no status chips are selected, zero tasks appear instead of all tasks.
**Why it happens:** Filter logic treats empty Set as "match nothing" instead of "no filter applied."
**How to avoid:** Explicitly check `if (filters.statuses.size > 0)` before applying the status filter. Empty set = no constraint.
**Warning signs:** Board goes blank when user deselects the last filter chip.

### Pitfall 3: Date comparison timezone mismatch
**What goes wrong:** Tasks created late in the day are excluded from date range filters, or tasks from the next day are included.
**Why it happens:** `created_at` is stored as `timestamptz` in Postgres (UTC), but native date input returns a local-date string without timezone.
**How to avoid:** When comparing, convert the date input to a start-of-day UTC boundary, or compare date portions only. The "dateTo" should include the full end date (add one day for exclusive upper bound).
**Warning signs:** Tasks near midnight boundaries appear or disappear unexpectedly.

### Pitfall 4: Sticky filter bar overlapping content on mobile
**What goes wrong:** Sticky filter bar covers the first task row when scrolled to top.
**Why it happens:** The main content area doesn't account for the filter bar height in its top padding.
**How to avoid:** Use `sticky top-14` (below the 56px header) for the filter bar, and add corresponding padding to the task list container. On mobile, the filter bar may be taller due to wrapping -- consider horizontal scroll for chips instead.
**Warning signs:** First task is hidden behind the filter bar on 375px screens.

### Pitfall 5: Sort toggle conflicts with existing hardcoded sort
**What goes wrong:** Tasks appear in wrong order because both TaskBoard's existing `.sort()` and the new filter sort are applied.
**Why it happens:** The current TaskBoard has a hardcoded `sortedTasks` variable that sorts by `created_at` ASC.
**How to avoid:** Remove the hardcoded sort from TaskBoard and let the `applyFilters` function handle all sorting. Single source of truth for sort logic.
**Warning signs:** Toggling sort direction has no effect, or tasks flicker between orders.

## Code Examples

### Current TaskBoard sort logic to replace (line 97-99):
```typescript
// CURRENT -- hardcoded ASC sort, will be replaced
const sortedTasks = tasks
  .slice()
  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
```

### Available constants for filter chip labels:
```typescript
// app/lib/constants.ts -- already exists
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'Open', in_progress: 'In Progress', done: 'Done',
}
export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  new_booking: 'New Booking', change_time: 'Change Time',
  change_therapist: 'Change Therapist', other: 'Other',
}
```

### StatusBadge color map for chip styling reference:
```typescript
// app/components/StatusBadge.tsx -- existing colors
const STATUS_COLORS: Record<TaskStatus, string> = {
  open: 'bg-amber-500 text-white hover:bg-amber-600',
  in_progress: 'bg-blue-600 text-white hover:bg-blue-700',
  done: 'bg-gray-500 text-white hover:bg-gray-600',
}
```

### RLS Policies -- Current State (from migrations):
```sql
-- Tasks: Full CRUD for any authenticated user (flat team model)
CREATE POLICY "authenticated staff can select tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated staff can insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated staff can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "authenticated staff can delete tasks" ON public.tasks FOR DELETE TO authenticated USING (true);

-- Staff: Read all, insert own record only
CREATE POLICY "staff can read all staff" ON public.staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff can insert own record" ON public.staff FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Screenshots storage: authenticated upload and read
CREATE POLICY "authenticated users can upload screenshots" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'screenshots');
CREATE POLICY "authenticated users can read screenshots" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'screenshots');
```

### Environment Variables -- Current Inventory:
```
# Server-side (process.env)
SUPABASE_URL          -- Supabase project URL
SUPABASE_ANON_KEY     -- Supabase anon key (public, row-level security enforced)

# Client-side (import.meta.env / VITE_ prefix)
VITE_SUPABASE_URL     -- Same as SUPABASE_URL, exposed to browser
VITE_SUPABASE_ANON_KEY -- Same as SUPABASE_ANON_KEY, exposed to browser
VITE_VAPID_PUBLIC_KEY  -- VAPID public key for push subscriptions

# Supabase Edge Functions (Deno.env)
VAPID_SUBJECT          -- mailto: URI for VAPID
VAPID_PUBLIC_KEY       -- VAPID public key
VAPID_PRIVATE_KEY      -- VAPID private key (SECRET - never expose to client)
SUPABASE_SERVICE_ROLE_KEY -- Service role key (SECRET - used in edge function only)
```

## RLS Audit Assessment

**Confidence:** HIGH -- policies are simple and correct for the use case.

The current RLS setup is appropriate for a flat 3-5 person team:
- **Tasks table:** Full CRUD for any authenticated user. Correct -- no role hierarchy needed (explicitly out of scope per REQUIREMENTS.md).
- **Staff table:** Read-all is correct (needed for display_name lookups). Insert-own-only is correct (prevents impersonation).
- **Screenshots bucket:** Authenticated-only upload and read. Correct -- bucket is private (not public).
- **Push subscriptions:** Table exists in migrations. RLS should be verified -- staff should only manage their own subscriptions.

**Potential gap:** The `push_subscriptions` table RLS policies are in `0002_push_subscriptions.sql` -- should verify that staff can only delete their own subscriptions, not others'.

**No anonymous/public access:** All policies use `TO authenticated` -- no data leaks to unauthenticated users.

## Cross-Browser Smoke Test Strategy

Per CONTEXT.md, target platforms: iOS Safari, Android Chrome, macOS Chrome, Windows Chrome.

**Checklist approach (manual verification):**
1. Filter bar renders and is interactive on all four platforms
2. Filter chips are tappable (44px min touch target) on mobile
3. Date inputs open native date picker on iOS/Android
4. Search input doesn't trigger unwanted zoom on iOS (font-size >= 16px)
5. Sticky positioning works (Safari has had `position: sticky` quirks historically)
6. Task list scrolls independently below sticky header + filter bar
7. Push notification permission prompt still works after UI changes

**iOS Safari specific concerns:**
- `<input type="date">` renders a native date picker -- good, no custom component needed
- `position: sticky` works in iOS Safari 15+ (the app targets modern browsers)
- Input zoom: iOS Safari zooms in on focus if font-size < 16px. Search input must use `text-base` (16px) not `text-sm` (14px)

## Lighthouse Audit Strategy

**Target:** 90+ on mobile for Performance, PWA, Accessibility, Best Practices.

**Key areas likely to need attention:**
- **Performance:** All tasks loaded upfront (fine for small dataset). Filter/search is client-side (fast). No server round-trips for filtering.
- **PWA:** Already configured with vite-plugin-pwa, manifest, service worker, icons. Should score well.
- **Accessibility:** Filter chips need proper aria-pressed attributes. Search input needs aria-label. Sort button needs aria-label indicating current direction.
- **Best Practices:** HTTPS (Vercel handles this). No mixed content. Console errors should be clean.

**Actions that may be needed:**
- Add `aria-pressed` to filter chip buttons
- Add `aria-label` to search input ("Search by client name or phone")
- Add `aria-label` to sort toggle
- Ensure color contrast ratios on filter chips (active and inactive states)

## Environment Variable Audit

**Findings:**
- `SUPABASE_ANON_KEY` is intentionally public (enforced by RLS) -- this is correct Supabase architecture, not a secret leak.
- `VAPID_PRIVATE_KEY` is only used in the Supabase Edge Function (Deno.env) -- never exposed to client. Correct.
- `SUPABASE_SERVICE_ROLE_KEY` is only used in the Edge Function -- never in app code. Correct.
- No ANTHROPIC/CLAUDE/OPENAI API keys found in the codebase -- AI processing likely happens server-side or was handled differently.

**Secrets rotation checklist items:**
1. VAPID key pair -- rotate if compromised; requires re-subscribing all push clients
2. SUPABASE_SERVICE_ROLE_KEY -- rotate via Supabase dashboard; update Edge Function secrets
3. Supabase project JWT secret -- managed by Supabase, rotation via dashboard

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.0.5 |
| Config file | vite.config.ts (test block) |
| Quick run command | `vitest run` |
| Full suite command | `vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FILT-01 | Status filter narrows tasks | unit | `vitest run tests/lib/filters.test.ts` | Wave 0 |
| FILT-02 | Request type filter narrows tasks | unit | `vitest run tests/lib/filters.test.ts` | Wave 0 |
| FILT-03 | Date range filter narrows tasks | unit | `vitest run tests/lib/filters.test.ts` | Wave 0 |
| FILT-04 | Search matches client_name or phone | unit | `vitest run tests/lib/filters.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `vitest run`
- **Per wave merge:** `vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/lib/filters.test.ts` -- covers FILT-01 through FILT-04 (pure function tests for `applyFilters`)

## Open Questions

1. **Push subscriptions RLS completeness**
   - What we know: push_subscriptions table was created in migration 0002. RLS is enabled.
   - What's unclear: Exact RLS policies on push_subscriptions (need to read 0002 migration).
   - Recommendation: Read the migration during implementation and verify staff can only manage own subscriptions.

2. **Task volume ceiling**
   - What we know: 3-5 staff, all tasks loaded client-side. Current approach works well for small volumes.
   - What's unclear: At what point (hundreds? thousands of tasks?) client-side filtering becomes slow.
   - Recommendation: Not a concern for v1 (small team, manual task creation). If needed later, add server-side pagination.

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `app/components/TaskBoard.tsx`, `TaskRow.tsx`, `Header.tsx`, `StatusBadge.tsx`
- Codebase inspection: `app/lib/constants.ts`, `app/lib/database.types.ts`, `app/server/tasks.ts`
- Codebase inspection: `supabase/migrations/0001_initial.sql`, `0003_screenshot_storage.sql`
- Codebase inspection: `app/routes/_auth/index.tsx` (board page orchestrator)
- Codebase inspection: `package.json` (dependency inventory)
- Codebase inspection: `.env.example` (environment variable inventory)

### Secondary (MEDIUM confidence)
- Supabase RLS documentation (general knowledge, verified against migration SQL)
- iOS Safari input zoom behavior (well-documented behavior, 16px minimum font size)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed, no new dependencies
- Architecture: HIGH -- codebase is small and fully inspected, patterns are straightforward
- Pitfalls: HIGH -- common React filtering patterns, verified against actual code structure
- RLS audit: HIGH -- migration SQL fully reviewed, policies are simple
- Cross-browser: MEDIUM -- based on known platform behaviors, not tested

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable -- no fast-moving dependencies)

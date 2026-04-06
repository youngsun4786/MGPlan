# Phase 5: Bug Fixes - Research

**Researched:** 2026-04-05
**Domain:** TypeScript type errors, mobile HTML file input behavior
**Confidence:** HIGH

## Summary

Phase 5 addresses two bugs: (1) mobile photo upload forcing camera-only mode, and (2) 54 TypeScript compilation errors across the codebase. The photo fix is a one-line HTML attribute removal. The TypeScript fixes break into four categories: stale Supabase DB types causing `never` on all table operations (biggest cascade), missing service worker lib types, Deno edge function files included in Node tsc, and a handful of component/test-level type mismatches.

The critical insight is ordering: regenerating `database.types.ts` will cascade-fix the majority of errors (all `never` type errors in server functions, components, and the `_auth/index.tsx` `created_at` error). The SW tsconfig fix resolves 12 errors. Excluding Deno edge functions removes 11 errors. The remaining ~8 are localized fixes in individual files.

**Primary recommendation:** Regenerate Supabase types first (fixes ~23 errors), then fix tsconfig for SW and Deno exclusion (fixes ~23 more), then mop up the remaining ~8 localized type errors.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Remove `capture="environment"` attribute from the file input in `app/components/TaskForm.tsx`. This lets the OS show its standard file picker.
- **D-02:** Change button label from "Attach Screenshot" to "Attach Photo".
- **D-03:** Exclude `supabase/functions/` from tsconfig. Edge functions use Deno runtime.
- **D-04:** Add `lib: ["WebWorker"]` to tsconfig (likely a separate tsconfig for the SW file) to get proper ServiceWorkerGlobalScope types. Don't use inline casts.
- **D-05:** Regenerate `app/lib/database.types.ts` from live Supabase DB using `supabase gen types`.
- **D-06:** Fix TanStack Router Link `search` prop errors properly -- add required search params to Link components in `app/routes/signup.tsx`. No type assertions.
- **D-07:** Fix test file TS errors too. Scope is "zero errors across the entire codebase."

### Claude's Discretion
- Exact tsconfig structure for service worker (separate file vs composite project)
- Order of fixes (types first vs file-by-file)
- How to handle the `Uint8Array` / `BufferSource` error in `app/lib/push.ts`

### Deferred Ideas (OUT OF SCOPE)
None.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FIX-01 | Mobile photo picker allows selecting from photo library, not just camera | Remove `capture="environment"` from file input (line 302 of TaskForm.tsx), change label text |
| FIX-02 | `npx tsc --noEmit` passes with zero errors | 54 errors categorized into 4 fix groups: DB types regen, SW tsconfig, Deno exclusion, localized fixes |
</phase_requirements>

## Architecture Patterns

### Error Taxonomy (54 total errors)

**Group A: Stale database types causing `never` (~23 errors)**
Files affected: `app/server/tasks.ts`, `app/server/push.ts`, `app/server/auth.ts`, `app/components/TaskBoard.tsx`, `app/routes/_auth/index.tsx`

Root cause: `app/lib/database.types.ts` is stale. The Supabase generated types don't include newer columns (like `screenshot_url`) or tables (like `push_subscriptions`). When Supabase client can't match a table/column to the types, it resolves to `never`.

Fix: `npx supabase gen types --lang=typescript --project-id <project-id> > app/lib/database.types.ts`

**Group B: Service worker types (~12 errors)**
File: `app/sw.ts`

Root cause: tsconfig has `lib: ["ES2022", "DOM", "DOM.Iterable"]`. The `DOM` lib provides `ServiceWorkerGlobalScope` as a type but not as a global scope -- the SW methods (`addEventListener`, `clients`, `registration`, `skipWaiting`) are not available on `self`. The SW needs `WebWorker` lib instead of `DOM`.

Fix: Create a `tsconfig.sw.json` that extends the base but overrides `lib` to `["ES2022", "WebWorker"]` and `include` to only `["app/sw.ts"]`. Then add this as a project reference in the root tsconfig, or alternatively exclude `app/sw.ts` from the root tsconfig and add the SW tsconfig as a reference.

**Group C: Deno edge functions (~11 errors)**
File: `supabase/functions/notify-task/index.ts`

Root cause: tsconfig `include: ["**/*.ts", "**/*.tsx"]` picks up Deno files. These use `npm:` imports, `Deno` global, and have no Node type declarations.

Fix: Add `"exclude": ["supabase/functions/**"]` to `tsconfig.json`.

**Group D: Localized type mismatches (~8 errors)**

| File | Error | Fix |
|------|-------|-----|
| `app/components/TaskBoard.tsx:23` | Unused `hasActiveFilters` variable | Remove the unused variable |
| `app/components/TaskRow.tsx:76` | `(e: MouseEvent) => void` not assignable to `() => void` | Remove the `e` parameter from `handleBadgeClick` or update `StatusBadge` onClick type |
| `app/lib/push.ts:12` | `Uint8Array<ArrayBufferLike>` not assignable to `BufferSource` | Cast via `as Uint8Array` or use `new Uint8Array(...)` constructor explicitly |
| `app/routes/signup.tsx:86,197` | Missing `search` prop on `Link to="/login"` | Add `search={{ expired: undefined }}` since `/login` route validates a search schema with `expired` param |
| `tests/components/TaskBoard.test.tsx:63` | Missing `screenshot_url` in test data | Add `screenshot_url: null` to mock task objects |
| `tests/components/TaskBoard.test.tsx:68,73,80` | `Set<unknown>` not assignable to `Set<TaskStatus>` | Type the Set constructor: `new Set<TaskStatus>()` |
| `tests/components/TaskBoard.test.tsx:5` | Unused `mockOn` import | Remove unused import |
| `tests/components/TaskRow.test.tsx:23,30,37,44` | Missing `screenshot_url` in test data | Add `screenshot_url: null` to all mock task objects |

### Recommended Fix Order

1. **Exclude Deno edge functions** (tsconfig edit, instant -11 errors)
2. **Regenerate database types** (one command, cascade -23 errors)
3. **Create SW tsconfig** (new file + root tsconfig edit, -12 errors)
4. **Fix localized errors** (individual file edits, -8 errors)
5. **Remove `capture="environment"` + update label** (FIX-01)
6. **Verify with `npx tsc --noEmit`**

### Service Worker tsconfig Strategy

**Recommendation: Separate tsconfig with project references (TypeScript composite projects).**

Root `tsconfig.json`:
```json
{
  "exclude": ["supabase/functions/**", "app/sw.ts"],
  "references": [{ "path": "./tsconfig.sw.json" }]
  // ... rest unchanged
}
```

New `tsconfig.sw.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "WebWorker"],
    "types": ["vite/client"],
    "strict": true,
    "noEmit": true,
    "composite": true,
    "baseUrl": ".",
    "paths": { "~/*": ["./app/*"] }
  },
  "include": ["app/sw.ts"]
}
```

Note: `tsc --noEmit` with project references requires `tsc --build --noEmit` OR running tsc on each config separately. Since the root tsconfig will exclude `app/sw.ts`, running `npx tsc --noEmit` on root + `npx tsc --noEmit -p tsconfig.sw.json` must both pass. Alternatively, use `tsc -b` which respects references.

**Important caveat:** TypeScript composite projects require `composite: true` which in turn requires `declaration: true`. If `--noEmit` is the only check, a simpler approach is just two separate tsconfig files without the `references` field, and run `tsc --noEmit && tsc --noEmit -p tsconfig.sw.json`. This avoids the composite/declaration constraint entirely.

**Simpler approach (recommended):** Two independent tsconfigs, no references. Root excludes `app/sw.ts`. SW tsconfig covers only `app/sw.ts`. Verification: `npx tsc --noEmit && npx tsc --noEmit -p tsconfig.sw.json`.

### Uint8Array / BufferSource Fix

The error in `app/lib/push.ts` line 12:
```typescript
applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
```

`urlBase64ToUint8Array` returns `Uint8Array` but `applicationServerKey` expects `BufferSource | string | null`. The issue is TypeScript 5.x's stricter `ArrayBufferLike` vs `ArrayBuffer` distinction. The `Uint8Array.from()` creates a `Uint8Array<ArrayBufferLike>` which doesn't match `ArrayBufferView<ArrayBuffer>`.

Fix: Change the return to explicitly construct with `ArrayBuffer`:
```typescript
const outputArray = new Uint8Array(rawData.length)
for (let i = 0; i < rawData.length; ++i) {
  outputArray[i] = rawData.charCodeAt(i)
}
return outputArray
```

Or simpler: add an explicit type annotation on the return:
```typescript
return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0))) as Uint8Array<ArrayBuffer>
```

The `as Uint8Array<ArrayBuffer>` cast is safe here because `Uint8Array.from()` always creates a regular `ArrayBuffer`-backed array. This is the minimal change.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Database types | Manual type definitions | `npx supabase gen types` | Schema changes constantly; generated types stay in sync |
| SW global scope types | `declare` statements for each method | `lib: ["WebWorker"]` in tsconfig | TypeScript ships complete WebWorker lib declarations |

## Common Pitfalls

### Pitfall 1: Running supabase gen types without auth
**What goes wrong:** Command fails or generates empty/wrong types
**Why it happens:** Supabase CLI needs project ID and access token
**How to avoid:** Use `npx supabase gen types --lang=typescript --project-id <id>` with proper auth. Check `supabase/config.toml` or `.env` for project ID.
**Warning signs:** Generated file is suspiciously small or has no table definitions

### Pitfall 2: SW tsconfig breaking Vite build
**What goes wrong:** Adding `WebWorker` lib to root tsconfig removes DOM types, breaking all React components
**Why it happens:** `lib` array replaces (doesn't merge), so `["ES2022", "DOM", "WebWorker"]` is the full set
**How to avoid:** Use a separate tsconfig for the SW. Vite uses its own compilation; tsconfig is only for type-checking. The SW tsconfig does NOT affect Vite's build of `app/sw.ts`.
**Warning signs:** Components suddenly can't find `document`, `window`, etc.

### Pitfall 3: TanStack Router Link search params
**What goes wrong:** Link components to routes with `validateSearch` require the search params even if optional
**Why it happens:** TanStack Router is strict about route type safety. If a route defines search validation, all Links to that route must provide the search object.
**How to avoid:** Pass `search={{ expired: undefined }}` or `search={{}}` depending on how the validation schema handles missing keys. The login route's validator defaults missing `expired` to `undefined`, so `search={{}}` should work.
**Warning signs:** `MakeRequiredSearchParams` in error message

### Pitfall 4: Forgetting to verify after DB type regeneration
**What goes wrong:** Regenerated types introduce NEW type errors if schema diverged from code assumptions
**Why it happens:** If DB has columns the code doesn't know about (or vice versa), new mismatches appear
**How to avoid:** Run `npx tsc --noEmit` immediately after regeneration to see the new error count before making other changes
**Warning signs:** Error count goes up instead of down after regeneration

## Code Examples

### FIX-01: Remove capture attribute (TaskForm.tsx ~line 298-305)
```tsx
// BEFORE
<input
  ref={fileInputRef}
  type="file"
  accept={ACCEPTED_EXTENSIONS}
  capture="environment"          // <-- forces camera on mobile
  className="hidden"
  onChange={handleFileSelected}
/>

// AFTER
<input
  ref={fileInputRef}
  type="file"
  accept={ACCEPTED_EXTENSIONS}
  className="hidden"
  onChange={handleFileSelected}
/>
```

### FIX-01: Update label (TaskForm.tsx ~line 295)
```tsx
// BEFORE
Attach Screenshot

// AFTER
Attach Photo
```

### Exclude Deno functions (tsconfig.json)
```json
{
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["supabase/functions/**", "app/sw.ts"],
  // ...
}
```

### Fix Link search prop (signup.tsx)
```tsx
// BEFORE
<Link to="/login" className="...">Back to Sign In</Link>

// AFTER
<Link to="/login" search={{}} className="...">Back to Sign In</Link>
```

### Fix StatusBadge onClick type (TaskRow.tsx)
```tsx
// BEFORE (line 29)
function handleBadgeClick(e: React.MouseEvent) {

// AFTER -- remove unused parameter
function handleBadgeClick() {
```

### Fix test mock data (add screenshot_url)
```tsx
// Add to all mock task objects in test files:
screenshot_url: null,
```

### Fix Set type in tests (TaskBoard.test.tsx)
```tsx
// BEFORE
statuses: new Set(),

// AFTER
import type { TaskStatus } from '~/lib/constants'
statuses: new Set<TaskStatus>(),
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (via vite.config.ts `test` block) |
| Config file | `vite.config.ts` (inline test config) |
| Quick run command | `npm run test` |
| Full suite command | `npm run test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FIX-01 | Photo picker accepts library photos | manual-only | N/A (requires physical mobile device) | N/A |
| FIX-02 | Zero TypeScript errors | smoke | `npx tsc --noEmit && npx tsc --noEmit -p tsconfig.sw.json` | N/A (compiler check) |
| FIX-02 | Existing tests still pass | regression | `npm run test` | tests/components/*.test.tsx |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (and `npx tsc --noEmit -p tsconfig.sw.json` once that config exists)
- **Per wave merge:** `npx tsc --noEmit && npx tsc --noEmit -p tsconfig.sw.json && npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
None -- existing test infrastructure covers all phase requirements. The primary validation is `npx tsc --noEmit` which needs no test files.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Everything | Yes | v25.2.1 | -- |
| TypeScript (tsc) | FIX-02 verification | Yes | (via npx) | -- |
| Supabase CLI | DB type generation (D-05) | Yes (npx) | 2.84.10 | -- |
| Supabase project access | DB type generation (D-05) | Needs verification | -- | Use linked project config |

**Missing dependencies with no fallback:** None identified.

**Missing dependencies with fallback:** None.

**Note:** Supabase CLI is available via `npx supabase`. The `supabase gen types` command requires either a linked project (`supabase link`) or explicit `--project-id` flag. Check if project is already linked via `supabase/config.toml` or `.supabase` directory.

## Open Questions

1. **Supabase project linkage**
   - What we know: Supabase CLI is available via npx at version 2.84.10
   - What's unclear: Whether the project is already linked (has `.supabase/` or configured `supabase/config.toml` with project ref)
   - Recommendation: Try `npx supabase gen types --lang=typescript --linked > app/lib/database.types.ts` first; if that fails, check for project ID in env vars or config

2. **Post-regen type changes**
   - What we know: Current DB types are stale and missing columns/tables
   - What's unclear: Whether regenerated types will introduce any NEW mismatches we haven't accounted for
   - Recommendation: Run tsc immediately after regen, compare error count, address any new errors before proceeding

## Sources

### Primary (HIGH confidence)
- Direct `npx tsc --noEmit` output -- 54 errors catalogued and categorized
- Source file inspection -- all affected files read and error root causes identified
- tsconfig.json -- current configuration verified

### Secondary (MEDIUM confidence)
- TypeScript `lib: ["WebWorker"]` for service worker scope -- standard TypeScript approach, verified by `declare let self: ServiceWorkerGlobalScope` already in sw.ts
- TanStack Router Link search prop requirement -- verified by reading `/login` route's `validateSearch` definition

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new libraries needed, all fixes are config/code changes
- Architecture: HIGH - error taxonomy verified against actual tsc output
- Pitfalls: HIGH - based on direct observation of the codebase state

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (stable -- bug fixes don't depend on fast-moving ecosystem)

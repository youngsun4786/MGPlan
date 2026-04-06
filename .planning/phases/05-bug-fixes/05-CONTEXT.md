# Phase 5: Bug Fixes - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix two production issues: (1) mobile photo upload is restricted to camera-only, and (2) TypeScript compilation produces errors across the codebase. After this phase, `npx tsc --noEmit` passes with zero errors and mobile staff can upload photos from their library.

</domain>

<decisions>
## Implementation Decisions

### Photo Picker (FIX-01)
- **D-01:** Remove `capture="environment"` attribute from the file input in `app/components/TaskForm.tsx`. This lets the OS show its standard file picker — user chooses camera OR photo library.
- **D-02:** Change button label from "Attach Screenshot" to "Attach Photo" since it now accepts library photos too.

### TypeScript Errors — Edge Functions (FIX-02)
- **D-03:** Exclude `supabase/functions/` from tsconfig. Edge functions use Deno runtime — mixing with Node tsc is a known pain point. They have their own type system.

### TypeScript Errors — Service Worker (FIX-02)
- **D-04:** Add `lib: ["WebWorker"]` to tsconfig (likely a separate tsconfig for the SW file) to get proper ServiceWorkerGlobalScope types. Don't use inline casts.

### TypeScript Errors — Database Types (FIX-02)
- **D-05:** Regenerate `app/lib/database.types.ts` from live Supabase DB using `supabase gen types`. Supabase CLI is already configured. This fixes all `never` type errors on table operations.

### TypeScript Errors — Router Types (FIX-02)
- **D-06:** Fix TanStack Router Link `search` prop errors properly — add required search params to Link components in `app/routes/signup.tsx`. No type assertions.

### TypeScript Errors — Tests (FIX-02)
- **D-07:** Fix test file TS errors too. FIX-02 scope is "zero errors across the entire codebase" — tests must pass tsc as well.

### Claude's Discretion
- Exact tsconfig structure for service worker (separate file vs composite project)
- Order of fixes (types first vs file-by-file)
- How to handle the `Uint8Array` / `BufferSource` error in `app/lib/push.ts`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Source Files with Errors
- `app/components/TaskForm.tsx` — Photo upload input with `capture="environment"` (line ~302)
- `app/components/TaskBoard.tsx` — `display_name` property errors, unused variable
- `app/components/TaskRow.tsx` — MouseEvent handler type mismatch
- `app/lib/push.ts` — Uint8Array/BufferSource type error
- `app/routes/_auth/index.tsx` — Missing `created_at` property
- `app/routes/signup.tsx` — Missing `search` prop on Link components
- `app/server/auth.ts` — `display_name` on never type
- `app/server/push.ts` — Insert operation on never type
- `app/server/tasks.ts` — Insert/update operations on never type
- `app/sw.ts` — ServiceWorkerGlobalScope missing properties
- `tests/components/TaskBoard.test.tsx` — Missing `screenshot_url` in test data

### Type Definitions
- `app/lib/database.types.ts` — Supabase generated types (stale, needs regeneration)

### Configuration
- `tsconfig.json` — TypeScript configuration (needs exclude + SW lib changes)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/lib/database.types.ts`: Supabase generated types file — will be regenerated
- `app/lib/constants.ts`: Domain constants (task statuses, request types)

### Established Patterns
- Server functions use `createServerFn` with Supabase client auth pattern
- All table operations go through typed Supabase client
- Components import types from `database.types.ts` via aliases

### Integration Points
- Regenerated DB types will cascade fixes through server functions and components
- SW tsconfig change must not break Vite's build pipeline
- Test fixtures need to match updated type shapes

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard bug fix approaches apply.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-bug-fixes*
*Context gathered: 2026-04-05*

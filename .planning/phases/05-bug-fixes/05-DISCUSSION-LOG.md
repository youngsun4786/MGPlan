# Phase 5: Bug Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 05-bug-fixes
**Areas discussed:** Photo picker behavior, TypeScript strictness strategy, Database types approach

---

## Photo Picker Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Remove capture attribute | Lets the OS show its standard picker — user chooses camera OR photo library. Simplest fix, one line change. | ✓ |
| Two separate buttons | One 'Take Photo' button and one 'Choose from Library' button. More explicit but adds UI complexity. | |
| Keep camera default, add library option | Keep capture="environment" but add a second input for library access. | |

**User's choice:** Remove capture attribute
**Notes:** None

### Follow-up: Button Label

| Option | Description | Selected |
|--------|-------------|----------|
| Keep 'Attach Screenshot' | Staff know what it means — no need to change. | |
| Change to 'Attach Photo' | More accurate since it now accepts library photos too. | ✓ |

**User's choice:** Change to 'Attach Photo'

---

## TypeScript Strictness Strategy

### Edge Functions

| Option | Description | Selected |
|--------|-------------|----------|
| Exclude from tsc | Add supabase/functions/ to tsconfig exclude. Edge functions have their own Deno type system. | ✓ |
| Add Deno types to tsconfig | Install @types/deno or configure paths for Deno globals. | |
| Rewrite as Node-compatible | Replace Deno.serve and npm: imports with Node equivalents. | |

**User's choice:** Exclude from tsc

### Service Worker Types

| Option | Description | Selected |
|--------|-------------|----------|
| Add lib: WebWorker to tsconfig | Adds proper SW global types. May need separate tsconfig. | ✓ |
| Cast self and add inline types | Quick fix but less maintainable. | |
| You decide | Let Claude pick best approach. | |

**User's choice:** Add lib: WebWorker to tsconfig

### Test File Errors

| Option | Description | Selected |
|--------|-------------|----------|
| Fix tests too | FIX-02 says 'zero errors across entire codebase'. Tests should pass tsc too. | ✓ |
| Exclude tests from tsc | Only fix app source code. | |

**User's choice:** Fix tests too

### Router Type Errors

| Option | Description | Selected |
|--------|-------------|----------|
| Fix properly | Add required search params to Link components. | ✓ |
| Use type assertion | Cast with 'as any' to suppress. | |

**User's choice:** Fix properly

---

## Database Types Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Regenerate from live DB | Run supabase gen types to get fresh types matching actual schema. | ✓ |
| Manually define types | Write types by hand. More control but diverges from Supabase pattern. | |
| You decide | Let Claude pick best approach. | |

**User's choice:** Regenerate from live DB
**Notes:** Supabase CLI is already configured — no setup steps needed.

---

## Claude's Discretion

- Exact tsconfig structure for service worker (separate file vs composite project)
- Order of fixes (types first vs file-by-file)
- How to handle the Uint8Array / BufferSource error in app/lib/push.ts

## Deferred Ideas

None — discussion stayed within phase scope.

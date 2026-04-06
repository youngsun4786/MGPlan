---
phase: 5
reviewers: [gemini]
reviewed_at: 2026-04-05
plans_reviewed: [05-01-PLAN.md, 05-02-PLAN.md]
---

# Cross-AI Plan Review — Phase 5

## Gemini Review

### Summary
The implementation plans for Phase 5 are highly surgical, logically sequenced, and directly address the root causes identified in the research phase. By splitting the work into an Infrastructure Wave (Plan 01) and a Logic/UI Wave (Plan 02), the strategy ensures that the largest blocks of TypeScript errors (stale types and configuration mismatches) are cleared before tackling localized code fixes. The approach to the Service Worker types (using a separate `tsconfig.sw.json`) is an industry best practice.

### Strengths
- **Decoupled Type Environments**: Creating `tsconfig.sw.json` with the `WebWorker` library is the correct way to handle Service Workers in a Vite/TypeScript project
- **Root-Cause Resolution**: Regenerating `database.types.ts` immediately resolves nearly 42% of the total error count
- **UX Alignment**: Removing `capture="environment"` is the precise fix for the "camera-only" mobile issue
- **Comprehensive Test Coverage**: The plan explicitly includes fixing errors in test files and mock objects

### Concerns
- **MEDIUM — TanStack Router Search Params**: Plan 02 adds `search={{}}` to Link components. If routes actually require specific search parameters for validation, passing an empty object might satisfy the compiler but cause runtime logic issues or "missing search param" warnings from the router.
- **LOW — Supabase CLI Dependency**: `npx supabase gen types` requires either a linked remote project or a running local Supabase container. If the environment isn't authenticated, Task 2 of Plan 01 will fail.
- **LOW — Editor Context**: Once `app/sw.ts` is excluded from the main `tsconfig.json`, some IDEs may lose IntelliSense for that file unless the user explicitly opens it.
- **LOW — Screenshot vs. Photo Nomenclature**: Changing the label to "Attach Photo" is correct for UX, but ensure internal variable names (like `screenshot_url`) remain consistent or are updated if "Screenshot" terminology is being phased out.

### Suggestions
- Verify the Supabase client initialization is actually importing and using the `Database` type from the regenerated `database.types.ts`
- In `TaskRow.tsx`, verify if the unused `e: MouseEvent` param was originally intended for `e.stopPropagation()` to prevent row clicks when clicking action buttons
- In `tsconfig.sw.json`, ensure path aliases (like `~/*`) used in the main app are also defined if the Service Worker imports utility functions
- Add a step to Plan 01 to run a "pre-check" `tsc` after config changes but before code fixes to verify error count dropped as expected

### Risk Assessment
**LOW** — Changes are primarily configuration and type-safety hardening rather than new complex features. Configuration fixes address environment mismatches, type regeneration aligns code with existing database reality, UI changes are limited to a single HTML attribute and text label.

---

## Claude Review

*Skipped — Claude CLI cannot review from within an active Claude session.*

---

## Consensus Summary

*Single reviewer (Gemini). No cross-reviewer consensus possible.*

### Key Concerns

1. **MEDIUM — Search param validation**: Verify `search={{}}` doesn't cause TanStack Router runtime warnings (Gemini)
2. **LOW — Supabase CLI auth**: Ensure project is linked before running `supabase gen types` (Gemini)
3. **LOW — IDE experience**: SW file may lose IntelliSense after tsconfig exclusion (Gemini)

### Agreed Strengths
- Wave ordering is correct (config-level fixes first, localized fixes second)
- Separate SW tsconfig is industry best practice
- DB type regeneration is the highest-leverage fix

### Divergent Views
*Single reviewer — no divergent views to report.*

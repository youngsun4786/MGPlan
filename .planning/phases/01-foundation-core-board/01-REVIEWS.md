---
phase: 1
reviewers: [gemini, claude]
reviewed_at: 2026-04-01
plans_reviewed: [01-01-PLAN.md, 01-02-PLAN.md, 01-03-PLAN.md, 01-04-PLAN.md, 01-05-PLAN.md]
---

# Cross-AI Plan Review — Phase 1

## Gemini Review

### **Phase 1: Foundation & Core Board — Plan Review**

The implementation plans for Phase 1 are exceptionally robust and technically precise. They demonstrate a deep understanding of the current "post-Vinxi" state of **TanStack Start (v1.x)** and provide a clear, low-risk path to delivering a functional task board. The progression from scaffolding to data layer to UI is logically sound, and the adherence to design constraints (FIFO sort, 44px touch targets, Realtime) is total.

### **Strengths**

*   **Modern TanStack Start Patterns:** Correctly adopts the Vite plugin architecture (`tanstackStart()`) and the new builder-style `createServerFn` API (`.validator().handler()`), avoiding the many pitfalls associated with outdated 2024 documentation.
*   **Supabase SSR Best Practices:** Properly employs `@supabase/ssr` for cookie-based session management, ensuring that auth state is consistent across SSR and client-side hydration—a common pain point in full-stack React apps.
*   **Data Integrity & Traceability:** Every mutation (create, update, status change) is guarded by server-side auth checks, validated via Zod, and explicitly tracks `last_updated_by`, satisfying **TASK-07** from the start.
*   **Optimized Mobile UX:** The plan strictly enforces the **44px touch target** mandate and uses optimistic updates for status cycling, which is critical for staff scanning the board quickly on mobile devices.
*   **Validation Rigor:** Integrating Vitest and Testing Library in the first wave (Wave 0) ensures that every subsequent feature is built against a verifiable test suite rather than relying solely on manual smoke tests.

### **Concerns**

*   **Hydration Mismatch Risks (LOW):** While the plan uses `initialTasks` from the route loader, TanStack Start can occasionally trigger hydration mismatches if the server and client resolve auth state differently. Using the `@supabase/ssr` patterns mitigates this, but it requires careful synchronization of headers.
*   **Supabase Trigger Failures (LOW):** The `handle_new_user` trigger is a `SECURITY DEFINER` function. If it encounters a non-unique error (e.g., a schema mismatch), it will block user sign-ups. The plan includes an exception handler for `unique_violation`, which is a good safeguard.
*   **Nitro Beta Stability (LOW):** The project relies on the `nitro` Vercel preset which is currently in beta. While this is the official recommendation from TanStack, it introduces a minor dependency risk for production stability.
*   **Zod Validation Edge Cases (LOW):** The `client_name` and `phone` validations use `.min(1)`. Without `.trim()`, a user could bypass this with a single space.

### **Suggestions**

*   **Enhance Zod Schemas:** Add `.trim()` to all string inputs in `app/lib/schemas.ts` to ensure that whitespace-only entries do not pass validation.
*   **Environment Validation:** In Plan 01, consider adding a small utility to validate the presence of `SUPABASE_URL` and keys at startup (e.g., using a Zod schema for `process.env`) to avoid cryptic "undefined" errors later.
*   **Staff Onboarding:** The plan assumes the `staff` table is populated via the auth trigger. For the initial 3-5 staff, it would be helpful to include a small script or SQL snippet in `seed.sql` to invite/create these initial accounts.
*   **Skeleton UI Detail:** In Plan 04, ensure the loading skeleton matches the height and layout of a `TaskRow` (including the status badge circle) to minimize layout shift when the real data hydrates.

### **Risk Assessment**

**Overall Risk: LOW**

The plan is surgically precise and accounts for the most dangerous technical hurdles (TanStack Start versioning and Supabase SSR). The scope is well-defined and strictly limited to the "call-back queue" core value. The primary risk is external (Nitro beta stability), but this is mitigated by the modularity of the server functions, which could be adapted if the deployment target changed.

**Verdict: PROCEED**

---

## Claude Review

### Overall Assessment

These are exceptionally well-structured plans. The wave-based dependency ordering is correct, the research is thorough with verified package versions, and the plans reference specific design decisions and UI-SPEC contracts consistently. The main risks are around TanStack Start's relatively new API surface and the gap between test stubs and meaningful test coverage.

### Plan-by-Plan Analysis

**Plan 01-01 (Scaffold):**
- Correctly uses Vite plugin architecture and addresses Vinxi migration pitfall
- Concerns: scaffolding in non-empty directory, `shadcn init` interactive prompts missing `--yes` flag (MEDIUM), `npm run dev` verification timeout too short (LOW)

**Plan 01-02 (Auth):**
- Clean separation of browser/server clients
- **HIGH**: `login.tsx` `beforeLoad` uses `supabaseBrowserClient` which won't have cookies during SSR — will always show login page even for authenticated users
- **MEDIUM**: Auth tests assert nothing meaningful (`expect(true).toBe(true)`)
- `window.location.href = '/'` causes full page reload instead of client-side navigation

**Plan 01-03 (Task CRUD):**
- Schema-first approach is excellent; Zod schemas reusable across server and client
- **HIGH**: `staff:last_updated_by(display_name)` foreign key join may be ambiguous with two FKs to the same `staff` table (`created_by` + `last_updated_by`) — may need `staff!tasks_last_updated_by_fkey(display_name)`
- **LOW**: `.default('')` on optional strings creates empty strings instead of null in DB

**Plan 01-04 (Board UI + Realtime):**
- **HIGH**: Realtime INSERT/UPDATE payloads from `postgres_changes` only contain raw table data — no joined `staff` record. All task rows lose "Updated by" info after Realtime events.
- Optimistic status cycling with revert-on-error is good UX
- Sort could be memoized with `useMemo`

**Plan 01-05 (Form + Delete):**
- `react-hook-form` + `zodResolver` reusing Plan 03 schemas is correct
- **MEDIUM**: Edit → close → create dialog flow may show stale data without explicit `reset()` on prop changes
- 18-step human checkpoint is thorough

### Cross-Plan Issues

| Issue | Severity | Plans |
|-------|----------|-------|
| Realtime payload missing staff join | **HIGH** | 04, 05 |
| `login.tsx` `beforeLoad` uses browser client on server | **HIGH** | 02 |
| `staff:last_updated_by` FK ambiguity | **HIGH** | 03 |
| `shadcn init` interactivity blocks executor | **MEDIUM** | 01 |
| Auth tests are effectively no-ops | **MEDIUM** | 02 |
| Form state persistence across dialog open/close | **MEDIUM** | 05 |
| `app/` vs `src/` directory inconsistency with ARCHITECTURE.md | **MEDIUM** | All |

### Risk Assessment: **MEDIUM**

The two HIGH-severity issues (Realtime missing staff data, login.tsx SSR mismatch) are fixable without architectural changes — they're implementation bugs. With the suggested fixes, this phase should execute cleanly.

---

## Consensus Summary

### Agreed Strengths
- **TanStack Start expertise**: Both reviewers noted the plans correctly use the post-Vinxi architecture (Vite plugin, builder-style `createServerFn`)
- **Supabase SSR implementation**: Proper use of `@supabase/ssr` for cookie-based auth across SSR/client
- **Data integrity**: Server-side auth guards + Zod validation + `last_updated_by` tracking
- **Wave structure**: Logical progression from scaffold → data → UI → wiring
- **Test infrastructure**: Wave 0 test stubs before any feature development

### Agreed Concerns
- **Zod string validation (LOW)**: Both noted `.min(1)` without `.trim()` allows whitespace-only input
- **Nitro beta risk (LOW)**: Both acknowledged the beta status of the Vercel deployment target

### Divergent Views

| Topic | Gemini | Claude |
|-------|--------|--------|
| Overall risk | LOW — "surgically precise" | MEDIUM — "implementation bugs will surface" |
| Realtime staff join | Not flagged | HIGH — payload won't include joined staff data |
| login.tsx SSR | Not flagged | HIGH — browser client in beforeLoad won't work server-side |
| FK join ambiguity | Not flagged | HIGH — two FKs to staff table may cause ambiguous join |
| shadcn interactivity | Not flagged | MEDIUM — executor will hang on prompts |
| Auth test quality | Not flagged | MEDIUM — tests assert nothing meaningful |
| Form state reset | Not flagged | MEDIUM — stale defaultValues across dialog modes |

### Priority Fixes for Replanning

1. **Realtime staff data** (HIGH) — Realtime payloads don't include joins. Add a `staffMap` cache or follow-up query on INSERT/UPDATE events.
2. **login.tsx SSR auth check** (HIGH) — `supabaseBrowserClient` in `beforeLoad` runs on server. Use server client or move check to component.
3. **Supabase FK join hint** (HIGH) — Use explicit `staff!tasks_last_updated_by_fkey(display_name)` syntax for unambiguous join.
4. **shadcn init flags** (MEDIUM) — Add `--yes`/`--defaults` for autonomous execution.
5. **Zod .trim()** (LOW) — Add `.trim()` to string validators.
6. **Form reset on mode change** (MEDIUM) — Add `useEffect` to reset form when `open`/`task`/`mode` changes.

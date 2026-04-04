---
phase: 04
reviewers: [gemini]
reviewed_at: "2026-04-03T22:10:00Z"
plans_reviewed: [04-01-PLAN.md, 04-02-PLAN.md, 04-03-PLAN.md]
---

# Cross-AI Plan Review — Phase 04

## Gemini Review

### Summary
The implementation plans for Phase 04 are exceptionally well-structured, following a logical progression from pure logic foundation to UI wiring and final production hardening. The strategy of using a pure `applyFilters` function with TDD ensures that the core business logic is robust and easily verifiable, while the client-side approach appropriately matches the expected data volume for a small shop.

### Strengths
- **Separation of Concerns:** Splitting filter logic (`applyFilters`), state management (`useFilterState`), and UI (`FilterBar`) makes the system highly maintainable and testable.
- **Real-time Readiness:** Deriving filtered list synchronously during render ensures new tasks arriving via Supabase Realtime automatically respect active filters.
- **TDD for Business Logic:** Plan 01 starts with comprehensive test suite covering edge cases before UI is built.
- **iOS/Mobile Consideration:** `text-base` (16px) for inputs prevents iOS Safari auto-zoom.
- **Distinct Empty States:** Differentiating "No tasks yet" vs "No results found" prevents user confusion.

### Concerns
- **[MEDIUM] RLS Remediation Gap:** Research identifies potential security gap in `push_subscriptions` (staff deleting others' subscriptions), but Plan 03 only documents findings in a checklist. No explicit task to apply fix if vulnerability found.
- **[MEDIUM] Date Comparison Timezones:** `created_at` is UTC (`timestamptz`). Native date inputs provide local `YYYY-MM-DD`. Comparing may fail for tasks created late in the day in certain timezones without start-of-day/end-of-day UTC boundaries.
- **[LOW] Sticky Offset Brittleness:** `top-14` (56px) for sticky FilterBar assumes Header height remains exactly `h-14`. If Header changes, FilterBar may overlap or gap.
- **[LOW] FilterBar Vertical Growth:** On narrow screens, search + sort row combined with chips + dates row might eat significant vertical real estate.

### Suggestions
- Update Plan 03 Task 1 to include: "If RLS audit identifies gaps (specifically in `push_subscriptions`), implement the corrective migration immediately."
- Use CSS variable or shared constant for header height to keep FilterBar offset in sync.
- In `applyFilters`, convert local date string to proper ISO UTC boundary for accurate comparisons.
- In Plan 03, add mobile height check for last item scroll visibility above sticky FilterBar.

### Risk Assessment: LOW
Entirely client-side — easy to roll back. Data volume (5-15 tasks/day) ensures client-side processing remains performant. Primary risks are localized CSS positioning or timezone edge cases.

---

## Claude Review

*Skipped — Claude CLI is the current runtime. Excluded for review independence.*

---

## Codex Review

*Not available — Codex CLI not installed.*

---

## Consensus Summary

### Agreed Strengths
- TDD approach for core filter logic
- Clean separation of concerns (logic → hook → component)
- Appropriate client-side architecture for the data volume
- Good mobile/iOS awareness

### Agreed Concerns
1. **Timezone handling in date range filters** — UTC vs local date comparison needs explicit boundary normalization
2. **RLS audit is document-only** — should include remediation if gaps found
3. **Sticky positioning assumes fixed header height** — fragile coupling

### Divergent Views
*Single reviewer — no divergent views to report.*

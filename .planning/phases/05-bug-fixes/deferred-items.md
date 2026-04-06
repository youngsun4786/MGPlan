# Deferred Items - Phase 05

## Pre-existing Test Failure

**File:** `tests/components/TaskRow.test.tsx`
**Test:** "calls onEdit on row click"
**Issue:** The test clicks on the "Kim Minjun" text element, which is inside a `pointer-events-none` container. The click does not propagate to the overlay `div[role="button"]` that handles the edit action. This test was failing before Plan 02 changes (verified by running tests on clean main branch).
**Suggested fix:** Change the test to click on the `role="button"` element directly instead of the text content.

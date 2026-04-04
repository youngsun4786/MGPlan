# Hardening Checklist -- Phase 04

## 1. RLS Audit

| Table / Bucket | Policies | Expected | Actual | Verdict |
|---|---|---|---|---|
| **tasks** | SELECT, INSERT, UPDATE, DELETE | All `TO authenticated USING (true)` (flat team model) | 4 policies, all `TO authenticated USING (true)` / `WITH CHECK (true)` | PASS |
| **staff** | SELECT, INSERT | SELECT all authenticated; INSERT own (`id = auth.uid()`) | SELECT `USING (true)`, INSERT `WITH CHECK (id = auth.uid())` | PASS |
| **push_subscriptions** | SELECT, INSERT, DELETE | All scoped to `staff_id = auth.uid()` | SELECT `USING (staff_id = auth.uid())`, INSERT `WITH CHECK (staff_id = auth.uid())`, DELETE `USING (staff_id = auth.uid())` | PASS |
| **storage.objects (screenshots)** | INSERT, SELECT | Authenticated only, scoped to `bucket_id = 'screenshots'` | INSERT `WITH CHECK (bucket_id = 'screenshots')`, SELECT `USING (bucket_id = 'screenshots')` | PASS |

**Overall verdict: PASS** -- All RLS policies are correctly scoped. No remediation required.

**Notes:**
- tasks table uses flat team model (all authenticated staff have full CRUD) -- correct per D-08
- push_subscriptions correctly restricts each staff member to their own subscriptions only
- screenshots bucket is private (not public), authenticated reads only

---

## 2. Cross-Browser Smoke Test Checklist

- [ ] **iOS Safari:** Filter bar renders, chips tappable (44px targets), date inputs open native picker, search input no zoom (text-base), sticky positioning works, last task scrollable into view above filter bar
- [ ] **Android Chrome:** Same as iOS checks + last task scrollable above sticky bars
- [ ] **macOS Chrome:** All interactions work with mouse, keyboard tab navigation through filters
- [ ] **Windows Chrome:** Same as macOS

---

## 3. Lighthouse Audit Checklist

- [ ] Run Lighthouse on mobile emulation
- [ ] Performance score >= 90
- [ ] PWA score >= 90
- [ ] Accessibility score >= 90
- [ ] Best Practices score >= 90

**Key accessibility items verified in code:**
- [x] `aria-pressed` on all filter chip buttons
- [x] `aria-label` on search input ("Search by client name or phone")
- [x] `aria-label` on sort button (dynamic: "Sort: oldest first" / "Sort: newest first")
- [x] `aria-label` on date inputs ("Filter from date" / "Filter to date")
- [x] `role="group"` with `aria-label` on status and request type chip containers
- [x] Min 44px touch targets on all interactive elements
- [x] Color contrast: active chips (bg-blue-600 text-white) and inactive chips (bg-slate-100 text-slate-700) pass WCAG AA
- [x] `text-base` (16px) on search and date inputs prevents iOS Safari auto-zoom

---

## 4. Environment Variable Audit

| Variable | Exposure | Status |
|---|---|---|
| `SUPABASE_URL` / `VITE_SUPABASE_URL` | Client-side (public) | OK -- RLS-enforced, safe to expose |
| `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` | Client-side (public) | OK -- RLS-enforced, safe to expose |
| `VITE_VAPID_PUBLIC_KEY` | Client-side (public) | OK -- public key only, safe to expose |
| `VAPID_PRIVATE_KEY` | Edge Function only (`Deno.env`) | OK -- never in client bundle |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function only | OK -- never in client bundle |

**Additional checks:**
- No API keys (Anthropic, OpenAI, etc.) found in `.env` or client codebase
- All `VITE_` prefixed variables are intentionally public
- Private keys restricted to Supabase Edge Functions (server-side only)

**Secrets rotation procedure:**
- **VAPID keys:** Regenerate, redeploy Edge Function, all clients must re-subscribe to push
- **SERVICE_ROLE_KEY:** Rotate in Supabase dashboard, update Edge Function env
- **JWT secret:** Rotate in Supabase dashboard (invalidates all sessions)

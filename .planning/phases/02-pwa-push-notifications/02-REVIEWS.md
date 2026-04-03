---
phase: 2
reviewers: [gemini]
reviewed_at: 2026-04-02T20:00:00Z
plans_reviewed: [02-01-PLAN.md, 02-02-PLAN.md, 02-03-PLAN.md]
---

# Cross-AI Plan Review — Phase 2

## Gemini Review

The following is a structured review of the implementation plans for **Phase 2: PWA + Push Notifications**.

### 1. Summary
The plan is exceptionally thorough and technically sound, providing a robust path to transform the task board into a native-feeling PWA. It correctly identifies the critical path: using the `injectManifest` strategy to support custom push events, managing iOS standalone constraints, and implementing a server-side push dispatch via Supabase Edge Functions to avoid client-side round-trips. The separation of concerns between the PWA foundation (Plan 01), subscription management (Plan 02), and server-side dispatch (Plan 03) is logical and minimizes integration risk.

### 2. Strengths
- **Strategy Selection**: Using `injectManifest` is correctly identified as a requirement for push notifications, avoiding the common mistake of using `generateSW` which doesn't support custom listeners.
- **iOS Awareness**: The plan explicitly handles the iOS "Standalone Mode" requirement for Web Push (Pitfall 1), ensuring the UI doesn't prompt for permissions in environments where they are guaranteed to fail.
- **Security Posture**: Deliberately omitting the database webhook trigger from migrations to prevent leaking the Service Role Key in Git is a high-seniority decision.
- **Graceful Degradation**: The "Offline Shell" vs. "Mid-session Banner" distinction (D-05, D-06) provides a superior UX compared to standard "you are offline" error pages.
- **Proactive Asset Generation**: Plan 01 Task 1 Step 5 includes a scripted fallback for generating placeholder PNGs, ensuring the build pipeline remains autonomous even without design assets.
- **Cleanup Logic**: Plan 03 includes automated cleanup for "410 Gone" subscriptions, preventing database bloat and wasted execution time.

### 3. Concerns
- **SW Registration Scope (LOW)**: Plan 01 Task 2 Step 7 registers the Service Worker within the authenticated Board Page (`app/routes/_auth/index.tsx`).
    - *Risk*: If a user is offline and attempts to load the app while logged out (the `/login` page), the SW might not have been registered or active for that route yet.
    - *Impact*: The "Offline Shell" might not trigger for the login page on the very first offline load.
- **VAPID Dependency Chain (LOW)**: Plan 02 Task 2 Step 1 requires `VITE_VAPID_PUBLIC_KEY`, but the generation instructions are in Plan 03.
    - *Risk*: If the agent is strictly following the plan, Plan 02 might fail its "Act" phase if it tries to run the app to verify the subscription logic before the keys are generated.
- **npm:web-push in Deno (MEDIUM)**: As noted in Research, the compatibility of the `web-push` Node package in Supabase Edge Functions (Deno) can be temperamental due to native crypto dependencies.
    - *Risk*: The Edge Function might fail to deploy or run in the Supabase environment.

### 4. Suggestions
- **Global Registration**: Move the `registerServiceWorker()` call from the board page to `app/routes/__root.tsx`. This ensures the PWA manifest and service worker are active across the entire site, including the login page, which improves "Installability" signals for browsers.
- **Key Generation Placement**: Move the `npx web-push generate-vapid-keys` step from Plan 03 to the beginning of Plan 02. This allows the agent to populate `.env` immediately so that the subscription flow implemented in Plan 02 can be verified in a "live" state.
- **Deno-Native Fallback**: In Plan 03, explicitly instruct the agent to verify the Edge Function logs immediately after deployment. If `npm:web-push` throws crypto-related errors, switch immediately to `jsr:@negrel/webpush` as identified in the research.
- **Subtle Offline Banner Positioning**: Ensure the `OfflineBanner` (D-06) has a higher z-index than the `Header` if the header is sticky, or ensure it pushes the content down to avoid overlapping the top-most tasks.

### 5. Risk Assessment: LOW
The overall risk is **LOW**. The plans are highly aligned with the research findings and the specific constraints of the tech stack. The use of a human checkpoint for the VAPID/Webhook configuration is a safe way to handle external service dependencies that are difficult to automate reliably.

**Justification:**
- The technical stack (Vite PWA + Supabase + Web Push) is standard and well-documented.
- All high-risk pitfalls (iOS Safari, Service Worker updates, Stale subscriptions) are addressed in the tasks.
- The UI/UX decisions adhere strictly to the gathered context and UI-SPEC.

---

## Claude Review

*Claude CLI review failed (non-zero exit — likely requires interactive session). Skipped.*

---

## Codex Review

*Codex CLI not installed. Skipped.*

---

## Consensus Summary

*Single reviewer (Gemini). Consensus analysis requires 2+ reviewers — presenting Gemini findings as primary review.*

### Key Strengths (Gemini)
- Correct `injectManifest` strategy for push notification support
- iOS standalone mode constraint properly handled
- Security-conscious VAPID key management (no secrets in Git)
- Graceful offline UX with branded shell + mid-session banner separation
- Stale subscription cleanup (410 Gone) prevents database bloat

### Key Concerns (Gemini)
| Severity | Concern | Suggestion |
|----------|---------|------------|
| MEDIUM | `npm:web-push` Deno compatibility uncertain | Add explicit fallback to `jsr:@negrel/webpush` with log verification step |
| LOW | SW registered only in auth route — login page may not get offline shell | Move `registerServiceWorker()` to `__root.tsx` for global coverage |
| LOW | VAPID key generation in Plan 03 but needed by Plan 02 | Move key generation to start of Plan 02 |

### Actionable Items for Replanning
1. Move SW registration from board page to root layout (`__root.tsx`)
2. Move VAPID key generation from Plan 03 to Plan 02
3. Add Deno-native fallback instruction for Edge Function
4. Ensure OfflineBanner z-index relative to sticky header

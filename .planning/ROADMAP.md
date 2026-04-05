# Roadmap: Massage Shop Task Manager

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-04-05) → [Archive](milestones/v1.0-ROADMAP.md)
- 🚧 **v1.1 Reminders, Analytics & Fixes** — Phases 5-7 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-04-05</summary>

- [x] Phase 1: Foundation & Core Board (5/5 plans)
- [x] Phase 2: PWA + Push Notifications (3/3 plans)
- [x] Phase 3: AI Screenshot Processing (3/3 plans)
- [x] Phase 4: Filters, Search & Hardening (3/3 plans)

</details>

### 🚧 v1.1 Reminders, Analytics & Fixes

**Milestone Goal:** Keep tasks from going stale with automated reminders, give visibility into call patterns, and fix production issues.

- [ ] **Phase 5: Bug Fixes** - Fix mobile photo picker and TypeScript errors for production quality
- [ ] **Phase 6: Follow-up Reminders** - Automated push reminders when tasks stay Open too long
- [ ] **Phase 7: Analytics Dashboard** - Visibility into call volume, response time, and request mix

## Phase Details

### Phase 5: Bug Fixes
**Goal**: Production codebase is clean — no type errors, and mobile photo upload works from photo library
**Depends on**: Phase 4 (v1.0 complete)
**Requirements**: FIX-01, FIX-02
**Success Criteria** (what must be TRUE):
  1. Staff on mobile can tap the photo upload and choose an existing photo from their library (not forced into camera-only mode)
  2. Running `npx tsc --noEmit` produces zero errors across the entire codebase
**Plans**: TBD

### Phase 6: Follow-up Reminders
**Goal**: No task silently goes stale — staff get nudged when tasks sit in Open status too long
**Depends on**: Phase 5
**Requirements**: REM-01, REM-02, REM-03
**Success Criteria** (what must be TRUE):
  1. When a task stays in Open status longer than the configured threshold, all subscribed staff receive a push notification
  2. The reminder notification shows the client name and elapsed time since the task was created
  3. Once a task moves to In Progress or Done, no further reminders are sent for that task
**Plans**: TBD

### Phase 7: Analytics Dashboard
**Goal**: Staff can see call patterns at a glance — volume trends, response speed, and request mix
**Depends on**: Phase 5
**Requirements**: ANLYT-01, ANLYT-02, ANLYT-03, ANLYT-04
**Success Criteria** (what must be TRUE):
  1. A dedicated dashboard page shows the count of tasks created per day and per week
  2. The dashboard displays average elapsed time from Open to Done
  3. The dashboard shows a breakdown of tasks by request type (New Booking, Change Time, Change Therapist, Other)
  4. Dashboard data refreshes automatically without the user needing to reload the page
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:** Phase 5 → Phase 6 → Phase 7

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 1. Foundation & Core Board | v1.0 | 5/5 | Complete | 2026-04-01 |
| 2. PWA + Push Notifications | v1.0 | 3/3 | Complete | 2026-04-02 |
| 3. AI Screenshot Processing | v1.0 | 3/3 | Complete | 2026-04-03 |
| 4. Filters, Search & Hardening | v1.0 | 3/3 | Complete | 2026-04-04 |
| 5. Bug Fixes | v1.1 | 0/? | Not started | - |
| 6. Follow-up Reminders | v1.1 | 0/? | Not started | - |
| 7. Analytics Dashboard | v1.1 | 0/? | Not started | - |

---
*Roadmap created: 2026-03-31*
*v1.1 milestone added: 2026-04-05*

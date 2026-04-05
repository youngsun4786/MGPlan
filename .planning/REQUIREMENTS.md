# Requirements: Massage Shop Task Manager

**Defined:** 2026-04-05
**Milestone:** v1.1 — Reminders, Analytics & Fixes
**Core Value:** Every incoming call gets logged and followed up — zero leads fall through the cracks.

## v1.1 Requirements

### Bug Fixes

- [ ] **FIX-01**: Mobile photo picker allows selecting from photo library, not just camera
- [ ] **FIX-02**: `npx tsc --noEmit` passes with zero errors

### Reminders

- [ ] **REM-01**: Staff receive a push notification when any task stays in Open status for longer than a configurable threshold
- [ ] **REM-02**: Reminder notification includes client name and how long the task has been open
- [ ] **REM-03**: Reminders stop once a task moves out of Open status

### Analytics

- [ ] **ANLYT-01**: Dashboard page shows number of tasks created per day and per week
- [ ] **ANLYT-02**: Dashboard shows average time from Open to Done
- [ ] **ANLYT-03**: Dashboard shows breakdown of tasks by request type
- [ ] **ANLYT-04**: Dashboard data updates without manual refresh

## Out of Scope

| Feature | Reason |
|---------|--------|
| Task assignment to specific staff | Flat team, everyone handles everything |
| Per-staff analytics | Not needed for 3-5 person team |
| Email reminders | Push notifications are sufficient |
| Historical trend charts (month-over-month) | Keep v1.1 dashboard simple — raw numbers first |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIX-01 | — | Pending |
| FIX-02 | — | Pending |
| REM-01 | — | Pending |
| REM-02 | — | Pending |
| REM-03 | — | Pending |
| ANLYT-01 | — | Pending |
| ANLYT-02 | — | Pending |
| ANLYT-03 | — | Pending |
| ANLYT-04 | — | Pending |

**Coverage:**
- v1.1 requirements: 9 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 9

---
*Requirements defined: 2026-04-05*

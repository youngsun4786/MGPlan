# Requirements: Massage Shop Task Manager

**Defined:** 2026-03-31
**Core Value:** Every incoming call gets logged and followed up — zero leads fall through the cracks.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: Staff can sign in with email and password
- [ ] **AUTH-02**: Session persists across browser refresh and app reopen
- [ ] **AUTH-03**: Protected routes redirect unauthenticated users to login

### Task Management

- [x] **TASK-01**: Staff can create a task via manual form with fields: client name, phone number, service requested, preferred date/time, notes, request type
- [x] **TASK-02**: Request type field supports: New Booking, Change Time, Change Therapist, Other
- [x] **TASK-03**: Task board displays all open tasks shared across all staff
- [x] **TASK-04**: Task status transitions: Open → In Progress → Done
- [x] **TASK-05**: Staff can edit a task after creation
- [x] **TASK-06**: Staff can delete or archive a task
- [x] **TASK-07**: Task shows which staff member last updated it and when
- [x] **TASK-08**: Form validates required fields (client name, phone) with clear error messages

### Realtime

- [x] **RT-01**: Task board updates in real time across all connected devices without page refresh
- [x] **RT-02**: New tasks appear instantly on all open sessions when created by any staff member

### AI Screenshot Processing

- [ ] **AI-01**: Staff can upload a KakaoTalk screenshot (drag-and-drop or tap-to-upload on mobile)
- [ ] **AI-02**: Claude vision API extracts client name, phone, service, date/time, notes, and request type from the screenshot
- [ ] **AI-03**: Extracted fields pre-fill the task creation form for staff review before saving
- [ ] **AI-04**: Fields with low extraction confidence are visually flagged for staff to verify
- [ ] **AI-05**: Unreadable screenshots fall back gracefully to the manual entry form

### Notifications

- [ ] **NOTF-01**: Staff receive a push notification when any new task is created
- [ ] **NOTF-02**: Push notification includes client name and request type
- [ ] **NOTF-03**: Staff can grant or deny push permission from within the app

### PWA & Mobile

- [ ] **PWA-01**: App is installable to home screen on iOS Safari and Android Chrome
- [ ] **PWA-02**: App loads an offline shell when network is unavailable
- [ ] **PWA-03**: UI is fully usable on mobile (375px+) and desktop (1024px+)

## v2 Requirements

### Filtering & Search

- **FILT-01**: Filter task board by status (Open, In Progress, Done)
- **FILT-02**: Filter by request type (New Booking, Change Time, Change Therapist)
- **FILT-03**: Filter by date range (created at)
- **FILT-04**: Search tasks by client name or phone number

### Enhancements

- **ENH-01**: Task assignment to a specific staff member
- **ENH-02**: Automated follow-up reminder if a task stays Open for >X hours
- **ENH-03**: Analytics dashboard (call volume, response time, conversion rate)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Fresha integration | Explicitly out of scope — staff book there separately |
| KakaoTalk bot / direct message ingestion | Screenshot upload covers v1; bot requires API access |
| Client history / CRM | Fresha owns this data |
| Multi-shop / multi-location | Single shop only for v1 |
| Role-based permissions | Flat 3-5 person team, no hierarchy needed |
| Native iOS/Android app | PWA covers mobile without app store overhead |
| OAuth / social login | Email/password is sufficient for a closed team |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| TASK-01 | Phase 1 | Complete |
| TASK-02 | Phase 1 | Complete |
| TASK-03 | Phase 1 | Complete |
| TASK-04 | Phase 1 | Complete |
| TASK-05 | Phase 1 | Complete |
| TASK-06 | Phase 1 | Complete |
| TASK-07 | Phase 1 | Complete |
| TASK-08 | Phase 1 | Complete |
| RT-01 | Phase 1 | Complete |
| RT-02 | Phase 1 | Complete |
| NOTF-01 | Phase 2 | Pending |
| NOTF-02 | Phase 2 | Pending |
| NOTF-03 | Phase 2 | Pending |
| PWA-01 | Phase 2 | Pending |
| PWA-02 | Phase 2 | Pending |
| PWA-03 | Phase 2 | Pending |
| AI-01 | Phase 3 | Pending |
| AI-02 | Phase 3 | Pending |
| AI-03 | Phase 3 | Pending |
| AI-04 | Phase 3 | Pending |
| AI-05 | Phase 3 | Pending |
| FILT-01 | Phase 4 | Pending |
| FILT-02 | Phase 4 | Pending |
| FILT-03 | Phase 4 | Pending |
| FILT-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after initial definition*

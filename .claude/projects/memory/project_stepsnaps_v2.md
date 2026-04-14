---
name: StepSnaps V2 — Job Applications
description: V2 adds a job applications tracker with status pipeline, interviews, and tabbed data table
type: project
---

V2 adds a dedicated Job Applications page within the active journey. Users create and manage individual job applications with company details, status tracking, and interview history.

**Key decisions:**
- Applications have statuses: pending → interviewing → on_hold → closed (with reason: rejected/withdrawn/no_response/success)
- Auto-status: first interview added changes status from pending to interviewing, sets responded_at date
- Tabbed layout: active applications tab + closed history tab (lazy-loaded)
- Paginated data table with search by company name and filter by status
- Interview rounds auto-increment; types include phone_screen, technical, behavioral, system_design, hiring_manager, other
- Work mode options: remote, onsite, hybrid (default: remote)

**Why:** Users tracking daily metrics also need to manage their application pipeline in one place.

**How to apply:** Reference `prd/v2-job-applications.md` and `plans/v2-job-applications.md` for full details.

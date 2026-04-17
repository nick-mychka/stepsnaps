# V2: Job Applications Tracker

## Problem Statement

Job seekers using Stepsnaps can track daily metrics (interviews done, applications sent) via snaps, but they have no way to manage and track individual job applications. They can't see which companies they've applied to, what stage each application is in, or review their interview history. This makes it hard to stay organized during an active job search, especially when juggling dozens of applications simultaneously.

## Solution

Add a dedicated **Job Applications** page that lets users create, track, and manage individual job applications within their active journey. Each application tracks company details, status (pending/interviewing/on_hold/closed), source, and a full interview history. The page uses a tabbed data table layout: one tab for active (non-closed) applications and one for closed application history.

## User Stories

1. As a job seeker, I want to add a new job application with company name, job title, salary, work mode, URL, and source, so that I can track each opportunity I'm pursuing.
2. As a job seeker, I want my applications to automatically start in "pending" status with today's date as the applied date, so that I don't have to set these manually.
3. As a job seeker, I want to see all my active (non-closed) applications in a paginated table sorted by applied date (newest first), so that I can quickly scan my pipeline.
4. As a job seeker, I want to filter the table by application status (pending, interviewing, on_hold), so that I can focus on applications at a specific stage.
5. As a job seeker, I want to search applications by company name, so that I can quickly find a specific application.
6. As a job seeker, I want to click on a company name in the table to open an edit dialog, so that I can update application details.
7. As a job seeker, I want to close an application by choosing a reason (rejected, withdrawn, no_response, success), so that I can track outcomes.
8. As a job seeker, I want tooltips on each closed reason explaining what it means (e.g., "Rejected - the company said no"), so that I pick the right one.
9. As a job seeker, I want closed applications to move to a separate "History" tab, so that my active view stays clean.
10. As a job seeker, I want the history tab to only load data when I open it, so that the page loads fast.
11. As a job seeker, I want the history tab to show the closed reason column, so that I can see how each application ended.
12. As a job seeker, I want to record interviews for each application (date, type, notes), so that I can prepare and track my interview pipeline.
13. As a job seeker, I want interview rounds to auto-increment, so that I don't have to manually number them.
14. As a job seeker, I want the application status to automatically change from "pending" to "interviewing" when I add my first interview, so that statuses stay accurate without manual updates.
15. As a job seeker, I want the `responded_at` date to be auto-set when the status changes to "interviewing", so that I can track response times.
16. As a job seeker, I want to manage all interviews for an application in a single dialog (add, edit, delete), so that I have a complete view.
17. As a job seeker, I want interview types to include phone_screen, technical, behavioral, system_design, hiring_manager, and other, so that I can categorize each round.
18. As a job seeker, I want to select a work mode (remote, onsite, hybrid) defaulting to remote, so that I can filter by preference later.
19. As a job seeker, I want to track the source of each application (e.g., LinkedIn) via a typeahead input, so that I can see which channels are most effective.
20. As a job seeker, I want to create a new source on-the-fly if my typed source doesn't exist yet, so that I'm not limited to predefined options.
21. As a job seeker, I want sources to be unique per user (case-insensitive), so that I don't accidentally create duplicates like "LinkedIn" and "linkedin".
22. As a job seeker, I want "LinkedIn" to be available as a predefined source, so that I have a starting point.
23. As a job seeker, I want to put an application "on_hold" from the edit dialog, so that I can pause tracking without closing it.
24. As a job seeker, I want to move an on_hold application back to "interviewing" or close it, so that I can resume or finalize it.
25. As a job seeker, I want the Applications nav item to only appear when I have an active journey, so that the navigation stays relevant.
26. As a job seeker, I want to see an empty state with a clear CTA when I have no applications yet, so that I know how to get started.
27. As a job seeker, I want the table to show 25 applications per page with pagination controls, so that the page stays performant with many applications.

## Implementation Decisions

### Data Model

- **JobApplication** table: tied to a Journey (one journey has many applications). Fields: id, journeyId (FK), companyName (required), jobTitle, salary, workMode (enum: remote/onsite/hybrid, default remote), jobUrl, sourceId (FK to Source, nullable), appliedAt (auto now), respondedAt (nullable, auto-set on first interview), status (enum: pending/interviewing/on_hold/closed, default pending), closedReason (enum: rejected/withdrawn/no_response/success, default no_response), timestamps.
- **Interview** table: tied to a JobApplication (one application has many interviews). Fields: id, jobApplicationId (FK), date, round (integer, auto-incremented), type (enum: phone_screen/technical/behavioral/system_design/hiring_manager/other), note (text), timestamps.
- **Source** table: per-user entity. Fields: id, userId (FK), name (varchar). Case-insensitive unique constraint on (userId, lower(name)). No edit/delete for now.
- Cascade deletes: Journey -> JobApplication -> Interview. Source uses set null on application delete.

### Status Transitions

Valid transitions enforced server-side:

- `pending` -> `interviewing` (auto, on first interview added)
- `pending` -> `on_hold` (manual, via edit dialog)
- `interviewing` -> `on_hold` (manual, via edit dialog)
- `interviewing` -> `closed` (manual, via close dialog)
- `on_hold` -> `interviewing` (manual, via edit dialog)
- `on_hold` -> `closed` (manual, via close dialog)
- No transitions out of `closed`.

### API Design (tRPC routers)

**jobApplication router:**

- `list` (query): paginated, filterable by status, searchable by company name, split by tab (active vs closed). Returns `{ items, total, page, perPage }`.
- `byId` (query): single application with interviews.
- `create` (mutation): accepts `sourceName` string, does find-or-create on Source table server-side.
- `update` (mutation): update fields + manual status changes (to on_hold). Validates transitions.
- `close` (mutation): separate procedure, sets status=closed + closedReason.

**interview router:**

- `list` (query): all interviews for an application, ordered by round.
- `create` (mutation): auto-calculates round. If first interview and status is pending, auto-transitions to interviewing + sets respondedAt.
- `update` (mutation): update date, type, note. Round is not editable.
- `delete` (mutation): remove an interview.

**source router:**

- `search` (query): typeahead search, ILIKE match, limit 10.
- `list` (query): all user sources.

### Source Seeding

"LinkedIn" is lazily seeded when the user first visits the applications page or creates their first application (similar to predefined step definitions pattern in journey.start).

### UI Architecture

- **Route**: `/applications` as a new protected route under `_authenticated/`.
- **Nav**: Conditional "Applications" button in header, only rendered when user has an active journey. Uses `useQuery` (non-suspense) for `journey.active` to conditionally render.
- **Table**: TanStack Table with manual server-side pagination (`pageCount` from API). Columns: company name (clickable), job title, salary, work mode, source, applied at, status (badge), interviews (button).
- **Tabs**: shadcn Tabs for Active vs History. History tab uses `enabled: activeTab === "closed"` for lazy loading.
- **Dialogs**: Add Application, Edit Application, Close Application (radio group), Interviews Management (full CRUD list).
- **Source Typeahead**: Popover + Command (combobox pattern) querying `source.search`. Shows "Create [name]" option when no match found.

### New shadcn/ui Components Required

Table, Tabs, Select, Pagination, RadioGroup, Tooltip, Popover, Command.

### Ownership & Security

Every jobApplication and interview procedure verifies the underlying journey belongs to the authenticated user by joining through journeyId -> Journey.userId.

## Testing Decisions

- Good tests verify external behavior (API inputs/outputs, status transitions, data integrity) rather than internal implementation details.
- **Modules to test:**
  - `jobApplication` router: CRUD operations, pagination, filtering, status transition validation (valid and invalid transitions), ownership checks.
  - `interview` router: CRUD operations, auto-round-increment, auto-status-transition on first interview, ownership checks.
  - `source` router: search, case-insensitive uniqueness, find-or-create within application creation.
- **Prior art**: Check existing test patterns in the repo (if any exist for journey/snap routers). Follow the same test setup and utilities.

## Out of Scope

- Editing or deleting sources (explicitly noted as "no edit/delete for now").
- Linking "success" closed reason to the journey finish flow (decided to keep separate).
- Mobile (Expo) UI for job applications.
- Analytics or reporting on application sources/outcomes.
- Bulk operations (bulk close, bulk delete).
- Export functionality (CSV, etc.).
- Job application sharing within teams.
- Field selector for search (may be added later, currently search is company name only).
- Editing applications from the History tab (no edit needed there).

## Further Notes

- The close dialog uses radio buttons with `no_response` preselected. On submit, status changes to "closed" and the table refetches.
- Closed reason tooltips:
  - **Rejected**: The company said no. They reviewed your application or interviewed you and decided not to move forward.
  - **Withdrawn**: You said no. You pulled out of the process (found another offer, lost interest, bad interview experience, etc.).
  - **No response**: Silence. You applied, never heard back.
  - **Success**: You got the offer.
- Status is displayed as a badge in the table. Consider color-coding: pending (gray), interviewing (blue), on_hold (yellow), closed (varies by reason).
- The interviews column in the table should show a count or "Set Interview" button. Clicking opens the InterviewsDialog.

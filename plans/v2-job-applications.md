# Plan: V2 Job Applications

> Source PRD: `prd/v2-job-applications.md`

## Architectural decisions

- **Route**: `/applications` under `_authed/`, conditional nav item visible only when active journey exists
- **Schema**: 3 new tables (Source, JobApplication, Interview) + 4 new enums (work_mode, job_application_status, closed_reason, interview_type). All tied to existing Journey via FK. Cascade deletes: Journey -> JobApplication -> Interview. Source FK uses set null.
- **Key models**: JobApplication belongs to Journey. Interview belongs to JobApplication. Source belongs to User. One journey has many applications, one application has many interviews.
- **API**: 3 new tRPC routers (jobApplication, interview, source) using `protectedProcedure` and `TRPCRouterRecord` pattern from existing routers. Ownership verified by joining through journeyId -> Journey.userId.
- **Table**: TanStack Table with manual server-side pagination. All table state (page, filters, search) managed in React state.
- **UI components**: shadcn Table, Tabs, Select, Pagination, RadioGroup, Tooltip, Popover, Command, Empty added to `packages/ui/`

---

## Phase 1: Create & List Applications

**User stories**: 1, 2, 3, 25, 26, 27

### What to build

The foundational slice: schema, API, and a working page where a user can add a job application and see it in a paginated table.

**Database**: Add `workModeEnum`, `jobApplicationStatusEnum`, `closedReasonEnum`, `interviewTypeEnum` enums. Add `Source` table (id, userId, name, case-insensitive unique index, timestamps). Add `JobApplication` table (id, journeyId, companyName, jobTitle, salary, workMode, jobUrl, sourceId, appliedAt, respondedAt, status, closedReason, timestamps). Add `Interview` table (id, jobApplicationId, date, round, type, note, timestamps). Add all relations. Generate migration.

**API**: `jobApplication.create` mutation (accepts all fields except source for now, auto-sets status=pending and appliedAt=now, verifies journey is active and belongs to user). `jobApplication.list` query (paginated, returns `{ items, total, page, perPage }`, default sort appliedAt desc, filters non-closed only, verifies journey ownership).

**UI**: Add shadcn Table, Tabs, Select, Pagination components to `packages/ui/`. Create `/applications` route with loader that prefetches the list. Add conditional "Applications" nav item in the authed layout (visible only when `journey.active` returns data). Build the ApplicationsTable using TanStack Table with columns: company name, job title, salary, work mode, applied at, status badge. Add pagination controls. Build AddApplicationDialog with form fields: companyName (required), jobTitle, salary, workMode (select, default remote), jobUrl. Show empty state (use shadcn Empty) with CTA when no applications exist.

### Acceptance criteria

- [x] All 3 tables and 4 enums exist in the database after migration
- [x] User can create a job application from the Add dialog
- [x] Applications appear in a paginated table (25 per page) sorted by applied_at desc
- [x] Status auto-set to "pending" and appliedAt auto-set to current date on create
- [x] "Applications" nav item only appears when user has an active journey
- [x] Empty state shows when no applications exist, with a CTA to add the first one
- [x] Journey ownership is enforced on all procedures

---

## Phase 2: Edit, Close & Status Transitions

**User stories**: 6, 7, 8, 23, 24

### What to build

Add the ability to edit an application and close it with a reason, with server-side status transition enforcement.

**API**: `jobApplication.update` mutation (update fields + change status to on_hold, validates transition rules). `jobApplication.close` mutation (separate procedure, sets status=closed + closedReason, validates that current status allows closing). `jobApplication.byId` query (single application with all details).

**UI**: Add shadcn RadioGroup and Tooltip components. Build EditApplicationDialog (pre-filled form, same fields as create, plus a button/option to set status to on_hold or trigger close). Clicking company name in the table opens the Edit dialog. Build CloseApplicationDialog (radio group with 4 closed reasons, no_response preselected, tooltips explaining each reason). On close submit, status changes to "closed" and table refetches.

**Status transition rules enforced server-side**:

- pending -> on_hold (manual)
- interviewing -> on_hold (manual)
- interviewing -> closed (manual)
- on_hold -> interviewing (manual)
- on_hold -> closed (manual)
- No transitions out of closed

### Acceptance criteria

- [x] Clicking company name in table opens Edit dialog with pre-filled values
- [x] User can update application fields (company, title, salary, work mode, URL)
- [x] User can set application to "on_hold" from Edit dialog
- [x] User can close an application via Close dialog with a reason selection
- [x] Closed reason tooltips display correctly
- [x] Invalid status transitions are rejected server-side with clear error
- [x] Closed applications disappear from the active table

---

## Phase 3: Source Typeahead

**User stories**: 19, 20, 21, 22

### What to build

Add the Source entity and a typeahead combobox for selecting/creating sources when adding or editing applications.

**API**: `source.search` query (ILIKE match on name for current user, limit 10). `source.list` query (all sources for user). Modify `jobApplication.create` and `jobApplication.update` to accept `sourceName` string, do find-or-create on Source table server-side (case-insensitive lookup). Lazy-seed "LinkedIn" as predefined source when user has no sources yet (on first application create).

**UI**: Add shadcn Popover and Command components. Build SourceTypeahead combobox (queries `source.search` on input, shows matching sources, shows "Create [name]" option when no match found). Integrate into AddApplicationDialog and EditApplicationDialog. Show source name in the table as a column.

### Acceptance criteria

- [x] Source typeahead shows existing sources as user types
- [x] User can create a new source on-the-fly from the typeahead
- [x] Sources are unique per user (case-insensitive) — creating "linkedin" when "LinkedIn" exists reuses the existing one
- [x] "LinkedIn" is auto-seeded as a predefined source on first use
- [x] Source column appears in the applications table
- [x] Source is persisted with the application and shows correctly on edit

---

## Phase 4: Interview Management

**User stories**: 12, 13, 14, 15, 16, 17

### What to build

Full interview CRUD with auto-round-increment and automatic status transitions when the first interview is added.

**API**: `interview.list` query (all interviews for an application, ordered by round asc). `interview.create` mutation (auto-calculates round as max existing + 1; if first interview and status is pending, auto-transitions application to "interviewing" and sets respondedAt to now). `interview.update` mutation (update date, type, note; round not editable). `interview.delete` mutation.

**UI**: Build InterviewsDialog accessible from a "Set Interview" button/count in the table's interview column. Dialog shows full list of existing interviews with edit/delete for each. Add form at bottom: date input, type select (phone_screen, technical, behavioral, system_design, hiring_manager, other), note textarea. Round auto-displayed (not editable). On first interview added, table row's status badge updates to "interviewing".

### Acceptance criteria

- [ ] "Set Interview" button appears in the interview column of the table
- [ ] InterviewsDialog shows all interviews for an application ordered by round
- [ ] User can add a new interview with date, type, and optional note
- [ ] Round number auto-increments (first interview = round 1, etc.)
- [ ] Adding the first interview auto-transitions status from "pending" to "interviewing"
- [ ] respondedAt is auto-set when status transitions to "interviewing"
- [ ] User can edit an existing interview's date, type, and note
- [ ] User can delete an interview
- [ ] Interview type options include all 6 types from the spec

---

## Phase 5: Filtering, Search & History Tab

**User stories**: 4, 5, 9, 10, 11, 18

### What to build

Add status filtering, company name search, and the tabbed layout with a lazy-loaded History tab for closed applications.

**API**: Extend `jobApplication.list` to accept `status` filter (optional enum), `search` string (ILIKE on companyName), and `tab` parameter ("active" for non-closed, "closed" for closed only). Active tab returns all non-closed statuses; closed tab returns only status=closed.

**UI**: Add status filter dropdown (Select) above the table, filtering by pending/interviewing/on_hold. Add company name search input. Implement shadcn Tabs layout: "Active" tab (current table, default) and "History" tab. History tab uses `useQuery` with `enabled: activeTab === "closed"` for lazy loading. History table is similar to active table but shows an additional closedReason column and does not have edit functionality. Status badge color-coding: pending (gray), interviewing (blue), on_hold (yellow), closed (varies by reason).

### Acceptance criteria

- [ ] User can filter active applications by status (pending, interviewing, on_hold)
- [ ] User can search applications by company name
- [ ] Tabs layout shows "Active" and "History" tabs
- [ ] Switching to History tab loads closed applications on demand (lazy)
- [ ] History table shows closedReason column
- [ ] History table does not have edit functionality
- [ ] Status badges are color-coded by status
- [ ] Search and filter work together (AND logic)
- [ ] Pagination resets when filters/search change

# Plan: StepSnaps V1 — Daily Hiring Journey Tracker

> Source PRD: `prd/v1-daily-hiring-journey-tracker.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Auth**: Google OAuth via Better Auth (already configured). Protected tRPC procedures enforce auth.
- **Database**: Drizzle ORM with PostgreSQL. All tables use UUID primary keys with `defaultRandom()`. Timestamps use `withTimezone: true`.
- **API**: tRPC routers added to `packages/api/src/router/` and registered in `root.ts`. All mutations use `protectedProcedure`. Queries for own data use `protectedProcedure`; team-view queries check membership.
- **Validation**: Zod schemas defined in `packages/validators/` and shared between API and frontend.
- **Frontend**: TanStack Start with file-based routing. Pages under `apps/tanstack-start/src/routes/`. UI built with existing shadcn/ui components (add more as needed via `ui-add`).
- **Charts**: Recharts for bar chart visualization.
- **Schema shape**:
  - `journey` — belongs to user, status enum (active/completed), start_date, end_date?, company_name?, offer_details?
  - `step_definition` — belongs to user, name, type enum (numeric/text), is_predefined, sort_order, is_active (soft delete)
  - `snap` — belongs to journey, date (unique per journey+date)
  - `snap_value` — belongs to snap, references step_definition, numeric_value?, text_value?
  - `team` — name, creator_id (admin)
  - `team_member` — team_id, user_id, status enum (pending/active/declined)
  - `team_invite` — token (unique), team_id, created_by, expires_at
- **Routes**:
  - `/` — landing / redirect to dashboard if authed
  - `/dashboard` — active journey overview, quick snap entry
  - `/journey/history` — list of past journeys
  - `/snap/new` — create/edit today's snap
  - `/settings/steps` — step configuration
  - `/progress` — chart and timeline views (tab or toggle)
  - `/teams` — team list, create team
  - `/teams/:teamId` — team detail, members, invite management
  - `/teams/:teamId/member/:userId` — view teammate's progress
  - `/invite/:token` — invite landing page (join/decline/private)

---

## Phase 1: Auth + Journey Lifecycle

**User stories**: 1–10

### What to build

A complete vertical slice from Google OAuth sign-in through journey creation, finishing, and history. After signing in, the user lands on a dashboard. If no active journey exists, they see a "Start Journey" prompt. Starting a journey records the start date and sets status to active. The dashboard shows the active journey's start date and a "Finish Journey" button. Finishing opens a dialog with optional company name and offer details fields; submitting (or dismissing) marks the journey as completed with an end date. A journey history page lists all past journeys with duration and status. The user can start a new journey only when no active one exists. Journey details (company name, offer details) are editable on completed journeys.

### Acceptance criteria

- [ ] User can sign in with Google OAuth and is redirected to the dashboard
- [ ] User can sign out
- [ ] Unauthenticated users are redirected to sign-in when accessing protected routes
- [ ] User can start a new journey (records start date, status=active)
- [ ] Only one active journey is allowed per user (API enforces this)
- [ ] Dashboard shows active journey info or "Start Journey" prompt
- [ ] User can finish a journey via a button that opens a dialog with optional company name and offer details
- [ ] Finishing a journey sets status=completed and records end date
- [ ] Journey history page lists all journeys with start date, end date, duration, and status
- [ ] User can edit company name and offer details on a completed journey

---

## Phase 2: Step Definitions + Daily Snap Creation

**User stories**: 11–23

### What to build

The step definitions and daily snap system. When a user creates their first journey, seed their account with the 7 predefined step definitions. The dashboard (or a dedicated snap page) shows a form with all active step definitions as inputs — numeric fields for numeric steps, a textarea for text steps. Submitting creates a snap for today (or updates it if one already exists). The API enforces one snap per calendar day per journey. The snap form is pre-populated with existing values if a snap already exists for today. Days without snaps are treated as empty/zero in queries.

### Acceptance criteria

- [ ] On first journey creation, 7 predefined step definitions are seeded for the user
- [ ] Snap form displays all active step definitions as inputs (numeric input or textarea)
- [ ] User can create a snap for today with values for each step
- [ ] API enforces one snap per calendar day per journey (upsert behavior)
- [ ] User can edit today's snap unlimited times (values update in place)
- [ ] Snap form pre-populates with existing values when editing
- [ ] Snap values are stored per step definition (numeric_value or text_value based on type)
- [ ] Days without snaps return empty/zero when queried

---

## Phase 3: Steps Configuration

**User stories**: 24–29

### What to build

A settings page where users manage their step definitions. Users can delete (soft-delete via `is_active=false`) predefined steps they don't need, and add custom steps with a name and type (numeric or text). Custom steps can be edited (name, type) or deleted. Changes only affect future snaps — past snap values retain their step definition references. The snap form dynamically reflects the current active step definitions.

### Acceptance criteria

- [ ] Settings page lists all step definitions (predefined and custom), showing active/inactive state
- [ ] User can deactivate (soft-delete) predefined steps
- [ ] User can add a custom step with name and type (numeric or text)
- [ ] User can edit a custom step's name and type
- [ ] User can delete (deactivate) custom steps
- [ ] Deactivated steps no longer appear in the snap form for new snaps
- [ ] Past snap values for deactivated steps are preserved and visible in timeline/charts
- [ ] Sort order is maintained and can be adjusted

---

## Phase 4: Progress — Timeline View

**User stories**: 36–39

### What to build

A vertical timeline view within the progress page. Each day that has a snap is rendered as a card showing the date and all step values for that day. Days without snaps can be shown as empty gaps or skipped. Each card has edit and delete actions. Editing opens the snap form pre-filled with that day's values. Deleting removes the snap entirely (with confirmation). The timeline is ordered reverse-chronologically (most recent first).

### Acceptance criteria

- [ ] Progress page has a timeline view showing snaps as vertical cards
- [ ] Each card displays the date and all step values (label + value)
- [ ] Cards are ordered reverse-chronologically
- [ ] User can click edit on a card to open the snap form pre-filled with that day's values
- [ ] User can save edits to any past snap (not just today)
- [ ] User can delete a snap from the timeline (with confirmation dialog)
- [ ] Empty/missed days are handled gracefully (skipped or shown as empty)

---

## Phase 5: Progress — Chart View

**User stories**: 30–35

### What to build

A bar chart view within the progress page using Recharts. The X-axis shows days from journey start to today (or journey end for completed journeys). Each step is a separate series/category. Numeric steps show their value directly. Text steps show 1 if content is present, 0 if absent. Hovering over a text step's bar shows the actual text content in a tooltip. The user can toggle between chart and timeline views on the progress page.

### Acceptance criteria

- [ ] Progress page has a chart view with a toggle between chart and timeline
- [ ] Bar chart renders with X-axis as days and Y-axis as step values
- [ ] Each active step definition is a separate series in the chart
- [ ] Numeric steps display their recorded values
- [ ] Text steps display 1 (present) or 0 (absent)
- [ ] Tooltip on text step bars shows the actual text content
- [ ] Chart spans from journey start date to today (active) or end date (completed)
- [ ] Days with no snap show as zero across all steps

---

## Phase 6: Teams + Invites

**User stories**: 40–50

### What to build

The full teams system. A user can create a team (becoming its admin). The admin generates invite links (unique tokens with expiration). When a non-registered user opens an invite link, they sign up via Google OAuth and then see a choice screen: join the invited team, create their own team, or use private tracking (no team). Existing users opening an invite link see the same choice (minus signup). Team members can belong to multiple teams. The admin sees a team detail page listing members and can view each member's individual progress (chart + timeline — reusing the components from phases 4 and 5). Admins can resend invites. Admin can only view, not edit/delete teammate data.

### Acceptance criteria

- [ ] User can create a team with a name
- [ ] Team creator is automatically the admin
- [ ] Admin can generate an invite link (unique token with expiration)
- [ ] Admin can resend/regenerate invite links
- [ ] Invite link landing page shows team info and options: join team, create own team, or private tracking
- [ ] Non-registered users are directed through Google OAuth before seeing the choice screen
- [ ] Accepting an invite adds the user as an active team member
- [ ] Declining sets member status to declined
- [ ] Users can be members of multiple teams
- [ ] Teams page lists all teams the user belongs to or administers
- [ ] Team detail page shows member list with status
- [ ] Admin can view a teammate's chart and timeline progress (read-only)
- [ ] Non-admin members cannot view other members' progress
- [ ] Admin cannot edit or delete teammate snaps

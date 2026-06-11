# Plan: Challenges

> Source PRD: `prd/challenges.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: `/challenges` (active list), `/challenges/$challengeId` (detail), `/archives/challenges` (history), all under the authenticated layout. History follows the existing archives convention alongside journeys and todos.
- **Schema**: `Challenge` table — userId, name, description (nullable), startDate, endDate (nullable), scheduledDays (set of weekday indices; everyday = all seven), videoId (nullable, canonical YouTube ID only), status enum `active | completed | stopped` (pgEnum, Journey pattern). `ChallengeCompletion` table — challengeId, date, with a unique constraint on (challengeId, date); row existence = completed, un-marking deletes the row. Dates are ISO strings (`date { mode: "string" }`), consistent with the rest of the schema. The full shape of both tables lands in Phase 1, even though later phases light up the columns.
- **Key models**: one pure **challenge logic module** (no I/O, no React) derives everything from (challenge config + completion dates + effective today): effective status, grid model, scheduled-day streak, stats. Router and UI both consume it; no date math in components or procedures beyond validation.
- **"Today"**: the client sends its local date with check-ins and today-dependent queries; the server validates it is within ±1 day of server time and uses it as the effective date (precedent: todo move-to-today).
- **API**: a `challenge` tRPC router with protected procedures, Zod inputs, and ownership (`userId`) checks in every where-clause, following the todo/journey router conventions. Detail/list endpoints return the challenge with its completions; grid and stats derive client-side.
- **Lifecycle**: `active → completed` is lazy on read when endDate < effective today (no cron); `active → stopped` is an explicit confirmed action and terminal.
- **Testing**: Vitest, introduced in Phase 3. Pure modules only (challenge logic, YouTube parser); external behavior through public interfaces; no DB or rendering tests.

---

## Phase 1: Create and list challenges

**User stories**: 1, 2, 3, 4, 5, 6, 7, 8, 11, 12

### What to build

The first tracer bullet: a user can create a challenge and see it in a list. Both schema tables land in full (including the status enum and completion table, even though nothing writes completions yet). The create form takes name (required), start date (defaults to today, future allowed), optional end date, schedule (everyday default, or custom weekday picker), and optional description — no video field yet. A `/challenges` page lists the user's active challenges with their basic facts, with a navigation entry alongside the existing sections. Multiple active challenges are allowed; no cap.

### Acceptance criteria

- [x] Migration creates both tables with the unique (challengeId, date) constraint and status enum
- [x] Creating with only a name succeeds: start = today, schedule = everyday, no end date
- [x] A custom schedule (e.g. Mon/Wed/Fri) and a future start date can be set at creation
- [x] End date before start date is rejected at validation
- [x] Created challenges appear on `/challenges` for their owner only
- [x] Two challenges can be active simultaneously

---

## Phase 2: Check-in on the detail page

**User stories**: 13, 14, 15, 16, 17, 18, 19

### What to build

Each challenge gets a detail page with the core mechanic: marking a day complete. The client sends its local date; the server validates it within ±1 day of server time, then enforces the rules — only today or yesterday, only scheduled days, only within the start/end range, only on active challenges. Marking is idempotent; un-marking deletes the completion. The detail page shows a today (and, when applicable, yesterday) check-in control and a simple completed-days count as a placeholder for the grid.

### Acceptance criteria

- [x] Today's scheduled day can be marked and un-marked from the detail page
- [x] Yesterday can be marked/un-marked; the day before yesterday is rejected server-side
- [x] Check-in on a non-scheduled day is rejected server-side
- [x] Check-in before the start date or after the end date is rejected
- [x] A client date more than ±1 day from server time is rejected
- [x] Marking the same day twice leaves exactly one completion
- [x] Another user's challenge returns not-found for check-in attempts

---

## Phase 3: The contribution grid

**User stories**: 20, 21, 22, 23, 24, 25, 26

### What to build

The visual heart of the feature. Vitest enters the repo here. The pure logic module gains the grid model: months → Monday-start weeks → day cells in four states (completed / missed / left / not-scheduled), leading blanks before the start date, bounded challenges rendering start → end, open-ended rendering start → effective today. A grid component on the detail page renders the model with clear month separation and horizontal scroll on small screens; it contains no date math of its own. Check-ins from Phase 2 light up immediately.

### Acceptance criteria

- [x] Vitest runs in CI/`npm test` (or workspace equivalent) and passes
- [x] Grid model tests cover: month separation, Monday week start, leading blanks, all four cell states, mid-week/mid-month starts, single-day challenge, end date on a non-scheduled day, open-ended vs bounded ranges
- [x] Detail page shows the grid grouped by month with the four states visually distinct
- [x] Marking/un-marking today updates the grid without a reload
- [x] An open-ended challenge's grid ends at today; a bounded one shows remaining days as "left"
- [x] Grid scrolls horizontally on a narrow viewport instead of breaking layout

---

## Phase 4: Streak and stats

**User stories**: 27, 28, 29

### What to build

The logic module gains the scheduled-day-aware streak (non-scheduled days are skipped, not broken; a missed scheduled day breaks it; today unchecked doesn't break a streak that ran through the last scheduled day) and the stats: scheduled days completed vs elapsed, and percent complete when an end date exists. The detail page displays streak and stats above the grid.

### Acceptance criteria

- [x] Streak tests cover: everyday and custom schedules, gaps over non-scheduled days, a missed scheduled day resetting to zero, today not yet checked, empty completions
- [x] A Mon/Wed/Fri challenge checked Mon and Wed shows streak 2 on Thursday
- [x] Detail page shows current streak and "X of Y scheduled days done"
- [x] Percent complete appears only when an end date is set

---

## Phase 5: Lifecycle and history

**User stories**: 33, 34, 35, 36, 37, 38, 39

### What to build

Challenges end. Stopping is an explicit action with a confirmation step and is terminal. Any read that returns challenges treats an active challenge whose end date has passed as completed (lazily, no cron) — it leaves the active list automatically. A `/archives/challenges` page lists completed and stopped challenges, labeled distinctly, most recently ended first, following the existing archives layout. Opening a past challenge shows its grid and stats read-only: no check-in controls.

### Acceptance criteria

- [x] Stopping requires confirmation and moves the challenge out of `/challenges`
- [x] A challenge whose end date passed shows as completed without any user action
- [x] `/archives/challenges` lists both outcomes with distinct completed/stopped labels
- [x] A past challenge opens with full grid and stats but no check-in controls
- [x] Check-in mutations against completed/stopped challenges are rejected server-side
- [x] Lazy-status tests cover: end date in past ⇒ completed, today/future ⇒ active, no end date ⇒ never auto-completes

---

## Phase 6: Editing rules

**User stories**: 40, 41, 42, 43, 44

### What to build

An edit affordance on the challenge. Name and description are always editable. End date is editable on an active challenge — extend, shorten, or clear to open-ended — but never to before the effective today. Start date and scheduled days are editable only while the challenge has zero completions; after the first check-in the server rejects changes to them and the form presents them as locked.

### Acceptance criteria

- [x] Name and description edits succeed on active and past challenges
- [x] End date can be extended, shortened, and cleared on an active challenge
- [x] Setting the end date before today is rejected
- [x] Start date and schedule edits succeed on a challenge with no completions
- [x] After one check-in, start date and schedule changes are rejected server-side and shown locked in the form

---

## Phase 7: YouTube video

**User stories**: 9, 10, 45

### What to build

The pure YouTube URL parser (watch, youtu.be, shorts, and embed URL shapes → canonical video ID; anything else → null) with tests. The create and edit forms gain an optional video link field validated through the parser — invalid links are rejected at input with a clear message. The detail page embeds the video via the privacy-enhanced no-cookie domain and hides the player entirely when the link is absent or the video fails to load.

### Acceptance criteria

- [x] Parser tests cover the accepted URL shapes plus junk, non-YouTube URLs, and empty input
- [x] A valid link at create or edit stores the canonical ID, not the raw URL
- [x] An invalid link is rejected at form submission with a clear message
- [x] Detail page embeds via the no-cookie domain when a video is set
- [x] No player area renders when no video is set or the embed fails

---

## Phase 8: Dashboard check-in widget

**User stories**: 30, 31, 32

### What to build

Challenges join the daily loop. The dashboard shows today's pending check-ins — active challenges scheduled today, based on the client-sent date — beside the todos, each markable inline. Already-checked challenges show as done (or drop out of the pending state, matching whichever treatment fits the dashboard's existing visual language). Challenges not scheduled today don't appear.

### Acceptance criteria

- [x] Dashboard lists active challenges scheduled today with their check-in state
- [x] Marking from the dashboard creates the same completion as the detail page (and reflects there immediately)
- [x] Challenges not scheduled today are absent from the widget
- [x] A challenge checked in from its detail page shows as done on the dashboard
- [x] With no active challenges scheduled today, the dashboard shows no empty artifact

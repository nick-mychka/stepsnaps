# PRD: Challenges

## Problem Statement

Stepsnaps users track their daily job-search activity through snaps and todos, but they have no way to commit to a personal habit over time — "do a LeetCode problem every day", "send three applications every Mon/Wed/Fri", "practice system design twice a week". Todos are one-off items tied to a single date; snaps record metrics but carry no notion of a sustained commitment with a defined cadence. Users who want to build a habit have nothing in the app that shows them a commitment, holds them to a schedule, visualizes their consistency over weeks and months, or preserves a record of past efforts.

## Solution

A new **Challenges** feature. A user creates a challenge with a name, a start date, an optional end date, a schedule (every day, or a custom subset of weekdays), an optional description, and an optional YouTube video to keep on the challenge page for reference or motivation.

While a challenge is active, the user checks in by marking scheduled days as completed — today or yesterday only, so the record stays honest. A contribution-style grid of squares (GitHub-like, but with clear month separation) shows completed days, missed days, remaining days (when an end date is set), and non-scheduled days at a glance. The challenge page also shows the current streak over scheduled days, how many scheduled days have been done, and percent complete when an end date exists.

The dashboard surfaces today's pending check-ins next to todos, so checking in is part of the existing daily loop rather than a separate page to remember.

A challenge ends in one of two ways: its end date passes (it becomes **completed**, regardless of how many days were missed — the grid tells the real story), or the user **stops** it early. Both outcomes are preserved, distinctly labeled, in the existing Archives section.

## User Stories

1. As a user, I want to create a challenge with a name, so that I can commit to a specific habit.
2. As a user, I want the start date to default to today, so that creating a challenge is fast.
3. As a user, I want to optionally set a future start date, so that I can plan a challenge before it begins.
4. As a user, I want to optionally set an end date, so that my challenge has a finish line.
5. As a user, I want to leave the end date empty, so that I can run an open-ended habit indefinitely.
6. As a user, I want the schedule to default to every day, so that the common case requires no configuration.
7. As a user, I want to select a custom subset of weekdays (e.g. Mon/Wed/Fri), so that my challenge matches a realistic cadence.
8. As a user, I want to add an optional description, so that I can record what the challenge means and how I define "done".
9. As a user, I want to attach an optional YouTube video link, so that the challenge page shows a video I'm following (a tutorial, a program, a motivation clip).
10. As a user, I want invalid YouTube links rejected at input time, so that I don't discover a broken video later.
11. As a user, I want to run multiple active challenges at once, so that I can track several habits in parallel.
12. As a user, I want a challenges page listing my active challenges, so that I can see all my commitments in one place.
13. As a user, I want each challenge to have its own detail page, so that I can focus on one commitment at a time.
14. As a user, I want to mark today as completed for a challenge, so that I can track my follow-through.
15. As a user, I want to un-mark today if I checked in by mistake, so that my record stays accurate.
16. As a user, I want to mark or un-mark yesterday, so that forgetting to check in before midnight doesn't break my record.
17. As a user, I want days older than yesterday to be frozen, so that the grid reflects what actually happened rather than retroactive edits.
18. As a user, I want my check-in recorded against my local date even when the server is in another timezone, so that an evening check-in doesn't land on tomorrow.
19. As a user, I want to check in only on scheduled days, so that the tracking matches the commitment I made.
20. As a user, I want to see a grid of squares for the challenge, so that I can take in my consistency at a glance.
21. As a user, I want the grid clearly separated by month, so that I can orient myself in time.
22. As a user, I want completed days visually distinct from missed days, so that I can see exactly where I slipped.
23. As a user, I want remaining future days shown when an end date is set, so that I can see how much of the challenge is left.
24. As a user, I want non-scheduled days visually distinct from missed days, so that rest days don't look like failures.
25. As a user, I want an open-ended challenge's grid to render from the start date through today, so that it grows with the habit.
26. As a user, I want to scroll the grid horizontally on a small screen, so that long challenges remain readable on mobile.
27. As a user, I want to see my current streak counted over scheduled days only, so that skipping a rest day doesn't reset it.
28. As a user, I want to see how many scheduled days I've completed out of those elapsed so far, so that I know my follow-through rate.
29. As a user, I want to see percent complete when an end date is set, so that I know how far along the challenge is.
30. As a user, I want the dashboard to show today's pending challenge check-ins next to my todos, so that checking in is part of my existing daily routine.
31. As a user, I want to mark a challenge complete for today directly from the dashboard, so that I don't have to open each challenge page.
32. As a user, I want challenges already checked in today to be reflected on the dashboard, so that I know I'm done.
33. As a user, I want a challenge whose end date has passed to show as completed, so that finished challenges leave my active list automatically.
34. As a user, I want to stop an active challenge early, so that I can abandon a commitment that no longer makes sense.
35. As a user, I want stopping to require confirmation, so that I don't end a challenge accidentally.
36. As a user, I want stopped challenges kept with their full grid, so that the effort I put in isn't erased.
37. As a user, I want a history of past challenges in the Archives section, so that finished and stopped challenges live where the app already keeps history.
38. As a user, I want completed and stopped challenges labeled differently in history, so that I can tell finished commitments from abandoned ones.
39. As a user, I want to open a past challenge from history and see its grid and stats, so that I can review how it went.
40. As a user, I want to edit a challenge's name, description, and video link at any time, so that cosmetic fixes are never blocked.
41. As a user, I want to extend or shorten the end date mid-challenge, so that I can adapt the finish line as I go.
42. As a user, I want the end date to never be settable before today, so that I can't retroactively cut a challenge short.
43. As a user, I want the start date and scheduled days locked after my first check-in, so that past squares always keep their meaning.
44. As a user, I want the start date and scheduled days editable before any check-in exists, so that I can fix a setup mistake on a fresh challenge.
45. As a user, I want the embedded video hidden if it becomes unavailable, so that the challenge page never shows a broken player.

## Implementation Decisions

### Data model

- New `Challenge` entity: owner (user reference), name (required), description (optional), start date, end date (optional), scheduled days, YouTube video ID (optional, canonical ID only — never the raw URL), and a status enum (`active | completed | stopped`), following the existing Journey status-enum pattern.
- Scheduled days stored as a set of weekday indices; "everyday" is simply all seven. There is no separate period type — a single scheduled-days representation drives all tracking, grid, and streak logic.
- New `ChallengeCompletion` entity: challenge reference + ISO date string, with a unique constraint on (challenge, date) — the same shape as the existing Snap-per-date pattern. A row's existence means the day is completed; un-marking deletes the row.
- Dates stored as ISO date strings (YYYY-MM-DD), consistent with the rest of the schema.

### Timezone / "today"

- The client sends its local date with every check-in and with queries that depend on "today" (dashboard pending list, active-challenge derivation). The server validates the client date is within ±1 day of server time and uses it as the effective date. This follows the existing precedent of the todo move-to-today mutation, which already accepts a client-supplied today.

### Lifecycle

- Status transitions: `active → completed` happens lazily — any read that returns challenges treats an active challenge whose end date is in the past as completed (and may persist the transition opportunistically). No cron or background job.
- `active → stopped` is an explicit user action with confirmation. Stopped is terminal; there is no resume.
- A challenge reaching its end date is completed regardless of miss rate.

### Check-in rules (enforced server-side)

- Toggling is allowed only for the effective today and yesterday.
- The date must be a scheduled day, within the challenge's start/end range.
- Only active challenges accept check-ins.
- Marking is idempotent (upsert-style); un-marking removes the completion.

### Editing rules (enforced server-side)

- Name, description, video link: always editable while the challenge exists.
- End date: editable on an active challenge, but never to a date before the effective today; clearing it (making the challenge open-ended) is allowed.
- Start date and scheduled days: editable only while the challenge has zero completions; locked afterwards.

### Modules

- **Challenge logic module (the deep module)** — pure functions with no I/O, no database, no React. Single input shape (challenge config + set of completion dates + effective today) from which it derives:
  - effective status (lazy end-date completion),
  - the grid model: months → weeks (Monday start) → day cells, each cell in one of four states: `completed`, `missed` (past scheduled day with no completion), `left` (future scheduled day, only meaningful when an end date exists), `not-scheduled`; leading blanks before the start date; open-ended challenges render through today, bounded ones through the end date,
  - current streak over scheduled days only (a missed scheduled day breaks it; non-scheduled days are skipped, not broken). The existing streak utility counts consecutive calendar days and is not reused — a new scheduled-day-aware function is part of this module,
  - stats: scheduled days completed vs. scheduled days elapsed, and percent complete when an end date is set.
- **YouTube URL parser** — pure function: URL string in, canonical video ID or null out. Accepts the common URL shapes (watch, short youtu.be, shorts, embed). Used for validation at input time; the UI embeds via the privacy-enhanced no-cookie domain.
- **Challenge API router** — tRPC router following the existing todo/journey router conventions (protected procedures, Zod inputs, ownership checks in every where-clause): list active, get by id, list past (history), create, update, toggle completion, stop.
- **UI** — challenges list route, challenge detail route (grid, stats, video, actions), create/edit form (shadcn/ui components like the rest of the app), the grid component (renders the grid model from the logic module; no date math in the component), a dashboard check-in widget beside todos, and a challenges history page under the Archives section alongside the existing journeys and todos archives.

### API contract notes

- The detail/list endpoints return the challenge with its completions; grid and stats are derived client-side by the shared logic module (avoids shipping a large cell array over the wire and keeps one source of truth for the math).
- The dashboard pending-check-ins query takes the client's today and returns active challenges scheduled today with their completion state for that date.
- History returns completed and stopped challenges with their status, ordered most recently ended first.

## Testing Decisions

- The repo currently has no test infrastructure. This feature introduces **Vitest** and establishes the pattern: test pure modules' external behavior through their public interface; no database, no React rendering, no implementation-detail assertions.
- **Challenge logic module** — the primary test target:
  - grid generation: month separation, Monday week start, leading blanks, all four cell states, open-ended vs. bounded rendering, challenges starting mid-week/mid-month, single-day challenges, end date on a non-scheduled day;
  - scheduled-day streak: everyday vs. custom schedules, non-scheduled gaps not breaking the streak, missed scheduled day breaking it, streak when today is unchecked but yesterday's scheduled day is checked, empty completions;
  - lazy status: end date in past ⇒ completed, today/future ⇒ active, no end date ⇒ never auto-completes;
  - stats: counts over scheduled days only, percent only with an end date.
- **YouTube parser** — accepted URL shapes map to the right ID; junk, non-YouTube URLs, and empty input return null.
- Router and UI are not covered by automated tests in this iteration; check-in rules are enforced server-side and verified manually.

## Out of Scope

- A "every week, any day counts" period type — schedules are concrete weekdays only.
- Backfilling days older than yesterday, or any admin override of frozen days.
- Reminders and notifications (push, email) for pending check-ins.
- Sharing challenges, team challenges, or any social/visibility features.
- Pausing/resuming a challenge; stop is terminal.
- Quantitative challenges (e.g. "50 pushups") — completion is binary per day; numeric tracking stays in snaps.
- Per-user timezone settings; the client-sent-date approach covers this feature, and a stored timezone (which would also benefit todos/snaps) is a separate effort.
- Migrating the existing todo/snap "today" handling to the client-sent-date approach.
- Challenge templates or duplicating a past challenge.
- Deleting challenges (history is append-only in this iteration).

## Further Notes

- "Completed" describes the lifecycle (the challenge ran its course), not success. A challenge finished at 40% follow-through is completed; the grid and stats communicate the actual performance. This is intentional — the feature's honesty is its value.
- The grid is the emotional core of the feature; the four states must be distinguishable at small sizes and the month separation obvious. There is an existing decorative SVG day-grid in the journey background component that can inform the visual style, but it is not interactive and is not a code dependency.
- Because grid and stats derive client-side from the completions list, an open-ended challenge running for years would ship an ever-growing list. At one row per day this stays small for any realistic horizon; not worth pagination now, noted in case it ever is.
- The ±1-day server validation of the client-sent date is a sanity bound against clock skew and tampering, not a security boundary — the worst a dishonest client can do is shift its own check-in by a day.

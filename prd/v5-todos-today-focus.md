# PRD: StepSnaps V5 — To-Do List ("Today's Focus" widget + History page)

## Problem Statement

Users track their daily progress with snaps, but they have no place to plan what they actually intend to *do* that day. There's no lightweight task list tied to a given day, so users can't jot down the things they want to accomplish, check them off as they go, or carry forward the things they didn't finish. When the day ends with unfinished items, those intentions simply vanish — there's no way to see what slipped or to pull yesterday's loose ends into today. Users want a simple daily to-do list, surfaced front-and-center on the dashboard, plus a way to look back at past days and resurrect unfinished work.

## Solution

Introduce **to-dos**: simple, dated tasks owned by a user. Each to-do belongs to a single calendar date and has a title and a completed flag — nothing more. Two surfaces expose them:

1. **The "Today's Focus" dashboard widget.** It shows today's to-dos with inline create / toggle-complete / edit / delete. When *yesterday* has unfinished items, the widget shows a nudge banner ("⚠ N unfinished yesterday — [Carry all over] [Review]"). "Carry all over" moves all of yesterday's unfinished items into today; "Review" expands those items inline so the user can carry them over one at a time.

2. **The To-Do History page.** A dedicated page listing past to-dos grouped by date (most recent first), showing both completed and unfinished items. From here the user can delete any item, and move any *unfinished* item — from any past date — into today.

"Moving" a to-do **reassigns its date to today** (it's the same record, not a copy). Because of this, once an item is carried over it naturally disappears from its old date, and the yesterday nudge banner clears itself once nothing unfinished remains on yesterday. To-dos are scoped to the user and a date only — they are independent of journeys, so the user always has a Today list even with no active journey. Items are shown in creation order; there is no manual reordering.

## User Stories

### Today's Focus widget — core CRUD
1. As a user, I want to see my to-dos for today on the dashboard, so that I know what I intend to accomplish at a glance.
2. As a user, I want to add a new to-do to today by typing a title and submitting, so that I can quickly capture a task.
3. As a user, I want to toggle a to-do between complete and incomplete, so that I can track what I've finished.
4. As a user, I want completed to-dos to be visually distinct (e.g. checked and struck through), so that I can tell at a glance what's done.
5. As a user, I want to edit the title of an existing to-do inline, so that I can fix typos or refine wording without recreating it.
6. As a user, I want to delete a to-do from today, so that I can remove tasks I no longer care about.
7. As a user with no to-dos today, I want a friendly empty state inviting me to add my first focus, so that the widget doesn't feel broken.
8. As a user, I want to-dos to persist across reloads and devices, so that my list is always there when I return.
9. As a user, I want a to-do list even when I have no active journey, so that planning my day never depends on journey state.

### Carry-over from yesterday (dashboard)
10. As a user, I want the widget to tell me when I left items unfinished yesterday, so that I'm reminded to continue them.
11. As a user, I want to see how many items were unfinished yesterday in the nudge, so that I know the size of what I left behind.
12. As a user, I want a one-tap "Carry all over" action, so that I can pull every unfinished item from yesterday into today at once.
13. As a user, I want a "Review" action that expands yesterday's unfinished items inline, so that I can choose which ones to carry over individually.
14. As a user reviewing yesterday's items, I want to move a single item into today, so that I only carry forward the things still worth doing.
15. As a user, I want the nudge banner to disappear once nothing unfinished remains on yesterday, so that the widget stays clean after I've dealt with it.
16. As a user, I want only *unfinished* items from yesterday to be offered for carry-over, so that I'm not re-adding things I already completed.
17. As a user, I want the carried-over item to appear in today's list immediately, so that I get instant feedback that it moved.

### To-Do History page
18. As a user, I want a dedicated To-Do History page, so that I can look back at what I planned on previous days.
19. As a user, I want past to-dos grouped by date with the most recent day first, so that the timeline reads naturally.
20. As a user, I want to see both completed and unfinished items in history, so that I have an honest record of each day.
21. As a user, I want to delete any past to-do from history, so that I can clean up clutter.
22. As a user, I want to move any unfinished past to-do into today from history, so that I can revive work from more than just yesterday.
23. As a user, I want completed past items to not offer a "move to today" action, so that the action only applies where it makes sense.
24. As a user with no past to-dos, I want a friendly empty state on the history page, so that an empty history is clearly intentional.
25. As a user, I want navigation to reach the To-Do History page, so that I can find it without typing a URL.

### Cross-cutting / integrity
26. As a user, I want my to-dos to be private to me, so that no one else can see or modify them.
27. As a user, I want "today" to follow my device's local date, so that my list rolls over consistently with the rest of the app.
28. As a user, I want moving an item that is already dated today to do nothing harmful, so that double-taps or stale UI don't corrupt my list.

## Implementation Decisions

### Data Model

Add one new table, **`Todo`**, following the existing `pgTable` + `relations` + `createInsertSchema` conventions in `packages/db/src/schema.ts`:

- `id` — uuid, primary key, default random.
- `userId` — text, not null, references `user.id` with `onDelete: "cascade"`. (Scoped to user, like `Source` / `StepDefinition` — **not** to a journey.)
- `date` — date, `mode: "string"`, not null. Stored as `YYYY-MM-DD`, consistent with `Snap`, `Journey`, etc.
- `title` — varchar(256), not null.
- `completed` — boolean, not null, default `false`.
- `createdAt` — timestamp with timezone, default now, not null.
- `updatedAt` — timestamp with timezone, `$onUpdateFn(() => sql\`now()\`)`.

Add `todoRelations` linking `Todo.userId` → `user`. No unique constraint on `(userId, date)` — a user has many to-dos per day. Ordering is by `createdAt` ascending; **no `position` column**.

A `CreateTodoSchema` via `createInsertSchema(Todo, { title: z.string().min(1).max(256) })` omitting `id`, `userId`, `completed`, `createdAt`, `updatedAt`.

A Drizzle migration will be generated for the new table.

### tRPC Router — `todoRouter`

New router at `packages/api/src/router/todo.ts`, registered in `packages/api/src/root.ts` as `todo`. All procedures are `protectedProcedure` and scope every query/mutation by `eq(Todo.userId, ctx.session.user.id)`, mirroring the ownership checks in `snapRouter`. The client passes the relevant date string(s) (computed via `src/lib/date.ts`), consistent with the existing Snap pattern of accepting a client date.

- **`byDate`** — input `{ date: string (YYYY-MM-DD) }`. Returns the user's to-dos for that date, ordered by `createdAt` asc. Used by the widget for today and (for the banner) yesterday.
- **`listPast`** — input `{ before: string (YYYY-MM-DD) }` (typically today). Returns the user's to-dos with `date < before`, ordered by `date` desc then `createdAt` asc. Backs the History page. (Grouping by date is done client-side.)
- **`create`** — input `{ date: string, title: string (1–256) }`. Inserts a to-do owned by the session user, `completed: false`. Returns the created row.
- **`update`** — input `{ id: string (uuid), title: string (1–256) }`. Updates the title of a to-do the user owns. Returns the updated row. (NOT_FOUND if not owned.)
- **`toggle`** — input `{ id: string (uuid), completed: boolean }`. Sets the completed flag on an owned to-do. Returns the updated row. (Kept separate from `update` so the title edit and the checkbox are independent, simple operations.)
- **`delete`** — input `{ id: string (uuid) }`. Deletes an owned to-do. Returns `{ success: true }`. (NOT_FOUND if not owned, matching `snap.delete`.)
- **`moveToToday`** — input `{ ids: string[] (uuid), today: string (YYYY-MM-DD) }`. Reassigns `date = today` for all owned to-dos in `ids`. This single mutation backs **both** the dashboard carry-over (single or "carry all") and the history page move. Accepting an array lets "Carry all over" be one round-trip. Behavior details below.

#### `moveToToday` semantics
- Only operates on to-dos owned by the session user; ids not owned are silently ignored (no leak of others' existence).
- **Reassigns** the record's `date` to `today` — same row, no copy. `updatedAt` bumps automatically.
- **No-op for items already dated today** — filtered out so a stale UI or double-tap can't thrash.
- The caller is responsible for only passing **unfinished** ids (the UI never offers move on completed items); the mutation itself does not filter on `completed`, keeping it a pure date-reassignment primitive. (Decision noted under Further Notes.)
- Returns the count moved (or the moved rows) so the client can react.

### Dashboard — "Today's Focus" widget

New component(s) under `apps/tanstack-start/src/routes/_authenticated/dashboard/-components/` (e.g. `today-focus-card.tsx`), composed into `-dashboard-page.tsx` alongside the existing cards. New hooks under `dashboard/-hooks/` (or a shared `_authenticated/todos/-hooks/`) wrapping the tRPC procedures with `useTRPC()` + React Query, invalidating the todo query keys on success and surfacing errors via `toast`, exactly like `use-upsert-snap.ts`.

- Computes `today()` and `yesterday()` from `src/lib/date.ts`.
- Fetches `todo.byDate({ date: today })` for the main list and `todo.byDate({ date: yesterday })` to compute the banner.
- **Main list:** each item renders a checkbox (→ `toggle`), an inline-editable title (→ `update`), and a delete control (→ `delete`). A persistent "add a focus" input creates a new to-do for today (→ `create`).
- **Empty state:** when today has no to-dos, show an inviting empty state prompting the first add.
- **Nudge banner:** shown only when the count of *unfinished* (`completed === false`) yesterday items is `> 0`. Renders "⚠ N unfinished yesterday" with:
  - **Carry all over** → `moveToToday({ ids: [all unfinished yesterday ids], today })`.
  - **Review** → expands the unfinished yesterday items inline; each has a "move to today" control → `moveToToday({ ids: [thatId], today })`.
- After any move, both the today and yesterday todo queries are invalidated; the banner clears automatically once yesterday has no unfinished items.

### To-Do History page

New route at `apps/tanstack-start/src/routes/_authenticated/todos/` with `index.tsx` (route definition) + `-todo-history-page.tsx` (component) + `-components/` + `-hooks/`, following the established page pattern (mirrors `journey/history/`).

- Fetches `todo.listPast({ before: today })`.
- Groups results by `date` client-side, rendered most-recent-date-first; within a date, creation order.
- Each item shows its title and completed state. Actions:
  - **Delete** → `delete` (any item).
  - **Move to today** → `moveToToday({ ids: [id], today })` (only rendered for **unfinished** items).
- **Empty state** when there are no past to-dos.
- A navigation entry (sidebar/menu, wherever the existing authenticated nav lives) links to the page.

### Key Constraints
- To-dos are user+date scoped; no journey association.
- "Today" is always the client's local date via `src/lib/date.ts`; the server trusts the date string the client sends (consistent with `Snap`).
- Move = date reassignment of the same record; never a copy.
- Dashboard carry-over reaches **yesterday only** (literal). Items 2+ days old are surfaced **only** on the History page. (Known limitation — see Further Notes.)
- Items ordered by `createdAt`; no drag-to-reorder.

## Testing Decisions

**Automated tests are deferred for this feature** (decision confirmed with the user). There is currently no test harness committed in the repo (no `*.test.ts` / `*.spec.ts` files found), and standing one up is out of scope here. The feature will be validated by **manual verification** — exercising create / toggle / edit / delete in the widget, the yesterday carry-over (both "carry all" and per-item "review"), and the history page's delete + move actions.

### If/when a harness is introduced later
A good test would verify external behavior through the public interface — given an input, assert the returned value or persisted side effect — not internal implementation details. The natural seam is the **tRPC `todoRouter`**, called with a session context against the database. Highest-value targets, in order:

- **`moveToToday`** (most logic): reassigns an unfinished past item's `date` to today (now returned by `byDate(today)`, gone from its old date); moves multiple ids in one call; no-op for items already today; ignores ids owned by another user.
- **CRUD + ownership:** create/update/toggle/delete affect only the session user's rows; another user's id yields NOT_FOUND and no mutation.
- **`byDate` / `listPast` scoping & ordering:** only the user's rows; `listPast` returns strictly `date < before`, most-recent-first.

## Out of Scope
- Drag-to-reorder / manual ordering / a `position` field.
- To-do descriptions, notes, due times, priorities, tags, or subtasks.
- Recurring/repeating to-dos or templates.
- Reminders, notifications, or email nudges about unfinished items.
- Automatic carry-over (items never move without an explicit user action).
- Surfacing items older than yesterday on the dashboard (only the History page reaches them).
- Associating to-dos with journeys, teams, or sharing to-dos with others.
- Creating to-dos for arbitrary past or future dates (creation is for "today" only; history is read + delete + move).
- Bulk delete or "clear completed" operations.
- Analytics on to-do completion rates, streaks, or progress-page integration.

## Further Notes
- **Single move primitive.** `moveToToday` is deliberately a thin date-reassignment over an array of owned ids. Both the dashboard ("carry all" = many ids, "review" = one id) and the history page ("move" = one id) reuse it. The "only unfinished items are movable" rule is enforced in the **UI** (the move control simply isn't rendered for completed items), keeping the server primitive simple and predictable. If we later want a server-side guard, it can filter `completed === false` without changing the contract.
- **Self-clearing banner.** Because moving reassigns dates, carrying over yesterday's items removes them from yesterday, so the unfinished-yesterday count drops to zero and the banner vanishes with no extra dismissal state to track.
- **Known limitation — yesterday only.** If a user skips several days, items from 2+ days ago won't appear in the dashboard nudge; they remain reachable on the History page. This is intentional to keep the dashboard focused on continuity, not backlog triage.
- **Timezone caveat.** Like the rest of the app, "today" is the client's local date with no stored user timezone. A user crossing time zones (or near midnight) sees the list roll over according to their device clock — acceptable and consistent with existing Snap behavior.
- **`toggle` vs `update` split.** Kept as two procedures so the checkbox and the title edit are independent, minimal operations; neither can accidentally clobber the other's field.
- **Deploy target:** Railway (per project memory) — the migration runs as part of the normal deploy/migration flow.

# Plan: To-Do List ("Today's Focus" widget + History page)

> Source PRD: `prd/v5-todos-today-focus.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**:
  - Dashboard widget lives on the existing `_authenticated/dashboard/` route (new colocated component in `dashboard/-components/`).
  - To-Do History page at a new route `_authenticated/todos/` (`index.tsx` route def + `-todo-history-page.tsx` + `-components/` + `-hooks/`), mirroring the `journey/history/` pattern. Reachable from the authenticated navigation.
- **Schema**: New `Todo` table in `packages/db/src/schema.ts`:
  - `id` uuid PK default random
  - `userId` text not null → `user.id` `onDelete: "cascade"`
  - `date` date `mode: "string"` not null (`YYYY-MM-DD`)
  - `title` varchar(256) not null
  - `completed` boolean not null default `false`
  - `createdAt` timestamptz default now not null
  - `updatedAt` timestamptz `$onUpdateFn(sql\`now()\`)`
  - `todoRelations`: `Todo.userId` → `user`. No `(userId, date)` unique. No `position` column. Drizzle migration generated.
  - `CreateTodoSchema` via `createInsertSchema(Todo, { title: z.string().min(1).max(256) })` omitting `id`, `userId`, `completed`, `createdAt`, `updatedAt`.
- **Key models**: `Todo` (user + date scoped; independent of journeys).
- **API**: New `todoRouter` at `packages/api/src/router/todo.ts`, registered as `todo` in `root.ts`. All `protectedProcedure`, every query/mutation scoped by `eq(Todo.userId, ctx.session.user.id)` (mirrors `snapRouter`). Procedures: `byDate`, `listPast`, `create`, `update`, `toggle`, `delete`, `moveToToday`.
- **Move semantics**: `moveToToday({ ids, today })` **reassigns** the row's `date` to today (same record, never a copy); no-op for items already today; ignores ids not owned by the session user. Single primitive backs both dashboard carry-over and history move. "Only unfinished items are movable" is enforced in the UI (move control not rendered for completed items).
- **Dates**: "Today"/"yesterday" computed client-side via `src/lib/date.ts` (`today()`, `yesterday()`, `ISO_DATE_FORMAT`); the server trusts the date string the client sends (consistent with `Snap`).
- **Frontend data**: hooks wrap tRPC via `useTRPC()` + React Query `useQuery`/`useMutation`, invalidate the relevant todo query keys on success, and surface errors with `toast` (pattern from `use-upsert-snap.ts`).
- **Ordering**: items ordered by `createdAt` asc; no manual reordering.
- **Testing**: Automated tests deferred (no harness in repo). Each phase is validated by manual verification.

---

## Phase 1: Today list — view + add

**User stories**: 1, 2, 7, 8, 9, 26, 27

### What to build

The tracer bullet that establishes the entire stack end-to-end. Create the `Todo` table and migration, add `todo.create` and `todo.byDate` to a new `todoRouter`, register the router, and build the "Today's Focus" widget on the dashboard. The widget fetches today's to-dos (via `byDate({ date: today() })`), renders them in creation order, provides an always-present input to add a new to-do for today, and shows a friendly empty state when there are none. To-dos are scoped to the session user and persist across reloads/devices; the list is available regardless of journey state.

### Acceptance criteria

- [x] `Todo` table exists with the documented columns and a generated Drizzle migration; relations registered.
- [x] `todoRouter` registered as `todo` in the root router with `byDate` (query) and `create` (mutation), both `protectedProcedure` and user-scoped.
- [x] `byDate` returns only the session user's to-dos for the given date, ordered by `createdAt` asc.
- [x] `create` inserts a to-do owned by the session user with `completed: false` for the supplied date; rejects empty/over-256-char titles.
- [x] The dashboard shows a "Today's Focus" widget listing today's to-dos.
- [x] Typing a title and submitting adds it to today's list immediately (cache invalidated), with errors surfaced via toast.
- [x] An inviting empty state appears when today has no to-dos.
- [x] The list renders correctly with no active journey.
- [x] Another user's to-dos are never returned.

---

## Phase 2: Complete the today CRUD

**User stories**: 3, 4, 5, 6

### What to build

Round out the widget to full CRUD. Add `todo.toggle`, `todo.update`, and `todo.delete` (all user-scoped, NOT_FOUND for rows not owned). Wire each into the widget: a checkbox toggles completion (with completed items visually distinct — checked + struck through), the title is inline-editable, and a delete control removes an item. `toggle` and `update` stay separate so the checkbox and title edit never clobber each other.

### Acceptance criteria

- [x] `toggle`, `update`, `delete` procedures exist, are `protectedProcedure`, and operate only on the session user's rows (NOT_FOUND otherwise, matching `snap.delete`).
- [x] Toggling an item flips its `completed` state and the UI reflects it (checked + struck-through styling).
- [x] Editing a title inline persists via `update` and rejects empty/over-256-char titles.
- [x] Deleting an item removes it from today's list immediately.
- [x] All mutations invalidate the today query and surface errors via toast.
- [x] A title edit never changes `completed` and a toggle never changes the title.

---

## Phase 3: Yesterday carry-over

**User stories**: 10, 11, 12, 13, 14, 15, 16, 17, 28

### What to build

Add the carry-over experience. Implement `todo.moveToToday({ ids, today })` as the shared date-reassignment primitive (no-op for items already today; ignores unowned ids; returns count/rows moved). The widget additionally fetches yesterday's to-dos (`byDate({ date: yesterday() })`) and, when the count of _unfinished_ yesterday items is greater than zero, shows a nudge banner: "⚠ N unfinished yesterday — [Carry all over] [Review]". "Carry all over" moves every unfinished yesterday item to today in one call; "Review" expands those items inline, each with a per-item move-to-today control. After any move, both the today and yesterday queries invalidate, so the banner clears itself once nothing unfinished remains on yesterday.

### Acceptance criteria

- [ ] `moveToToday` reassigns `date` to today for owned ids; same record (no copy), `updatedAt` bumps.
- [ ] Items already dated today are no-ops (not duplicated, not errored); ids owned by another user are ignored.
- [ ] The banner appears only when yesterday has at least one unfinished item, and displays the correct count.
- [ ] Only unfinished yesterday items are offered for carry-over (completed ones are not moved/offered).
- [ ] "Carry all over" moves all unfinished yesterday items in a single round-trip; they appear in today's list immediately.
- [ ] "Review" expands the unfinished yesterday items inline and each can be moved individually.
- [ ] After carrying everything over, the banner disappears with no manual dismissal.

---

## Phase 4: To-Do History page

**User stories**: 18, 19, 20, 21, 22, 23, 24, 25

### What to build

A dedicated To-Do History page at `_authenticated/todos/`. Add `todo.listPast({ before })` returning the user's to-dos with `date < before`, ordered `date` desc then `createdAt` asc. The page groups results by date client-side, newest day first, showing both completed and unfinished items. Each item offers delete (reuses `todo.delete`); unfinished items additionally offer move-to-today (reuses `todo.moveToToday`) — so carry-over from history reaches any past date, not just yesterday. A friendly empty state shows when there is no past history, and a navigation entry links to the page.

### Acceptance criteria

- [ ] `listPast` returns only the session user's to-dos strictly before the given date, ordered most-recent-date-first then creation order.
- [ ] The `_authenticated/todos/` route renders past to-dos grouped by date, newest day first.
- [ ] Both completed and unfinished items are shown; completed items do not show a move-to-today action.
- [ ] Deleting any item removes it immediately.
- [ ] Moving an unfinished item sends it to today (reassigned date); it disappears from history and appears in the dashboard widget.
- [ ] A friendly empty state appears when there are no past to-dos.
- [ ] A navigation entry reaches the History page.

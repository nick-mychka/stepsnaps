# Plan: V4 — Vacancy Text & AI Field Extraction

> Source PRD: `prd/v4-vacancy-text-and-ai-extraction.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: `/_authenticated/applications/new` (create) and `/_authenticated/applications/$id/edit` (edit). Both replace the existing `add-application-dialog` and `edit-application-dialog` modals. Save and Cancel return to `/applications`.
- **Schema**: Add a single nullable `vacancyText` text column to the `JobApplication` table. No HTML column at this stage. No per-field "AI-generated" flags in the database.
- **Key models**: `JobApplication` is the only model that changes shape. The existing `companyName`, `jobTitle`, `salary`, `workMode`, `jobUrl`, and `sourceName` fields are the targets of AI extraction.
- **AI stack**: `@anthropic-ai/sdk` directly, server-side, model Claude Haiku 4.5, tool use / structured output. No client-side AI calls. API key in server env only.
- **AI fill policy**: Extraction never overwrites a non-empty field. The client merges results into form state with empty-only semantics.
- **AI marker**: AI-filled fields are tracked in client state only — ephemeral, clears on edit, not persisted.
- **Auth**: All AI and write procedures use the existing `protectedProcedure` pattern.
- **Limits**: Vacancy text input is capped at 50,000 characters (enforced in the tRPC input schema). Per-user rate limit on the AI endpoint is 20 requests per hour, enforced in-memory (acceptable for single-instance Railway deploy; revisit if horizontal scaling lands).
- **Test framework**: Follow whatever pattern is already used in `packages/api`; do not introduce a new test framework as part of this plan.

---

## Phase 1: Replace dialogs with pages (feature parity)

**User stories**: 13, 14, 15, 17, 18, 19, 23

### What to build

A pure migration of the create and edit flows from modal dialogs to dedicated pages, with no new functionality. Two new routes (`/applications/new`, `/applications/$id/edit`) render a shared form component containing all the fields that exist today. The "Add Application" entry point and the row-click action in the applications table both navigate to these pages. Save and Cancel return to the applications table. The status actions (Put On Hold, Resume Interviewing, Close Application) remain available on the edit page. The two existing dialog components are deleted along with any dead imports they leave behind.

After this phase, a user can create and edit applications using the same fields as today, but on full pages instead of modals — the foundation for everything that follows.

### Acceptance criteria

- [ ] `/applications/new` renders a page containing all fields currently in the Add dialog and creates the application on submit.
- [ ] `/applications/$id/edit` renders a page pre-populated with the application's current values, all fields immediately editable.
- [ ] The Add Application button on the applications table navigates to `/applications/new`.
- [ ] The row-click action on the applications table navigates to `/applications/$id/edit`.
- [ ] Successful save on either page redirects to `/applications`.
- [ ] Cancel on either page returns to `/applications` without writing.
- [ ] Edit page exposes the same status actions as the previous edit dialog and they continue to behave the same way.
- [ ] `add-application-dialog.tsx` and `edit-application-dialog.tsx` are removed; nothing in the codebase still imports them.
- [ ] Pages are usable on mobile-sized viewports (no modal-induced cramping).

---

## Phase 2: Vacancy text storage

**User stories**: 1, 16

### What to build

Add the ability to capture and persist the original vacancy posting text on an application, but without any AI involvement. The schema gains a nullable `vacancyText` column. The shared form gains a large textarea labeled for vacancy details. Existing create and update procedures are extended to accept and persist the field. On the edit page the saved text is rendered back into the textarea, where it can be re-read or modified.

After this phase, a user can paste a posting into the create page, save, and the text round-trips correctly — viewable and editable later — but no AI extraction yet.

### Acceptance criteria

- [ ] `JobApplication` has a nullable `vacancyText` column; the migration is non-destructive against existing rows.
- [ ] The create and edit pages both render a large textarea for vacancy text.
- [ ] Submitting the create page persists the textarea contents.
- [ ] Submitting the edit page persists changes to the textarea contents.
- [ ] The edit page initial state shows the previously saved text.
- [ ] Applications created before this phase continue to work; their vacancy text simply renders as empty.
- [ ] No AI button or AI behavior is shipped in this phase.

---

## Phase 3: AI extraction MVP

**User stories**: 2, 3, 4, 5, 8, 9, 10, 11, 12, 22

### What to build

Wire the vacancy textarea up to Claude. A new server-side service encapsulates the Anthropic SDK, the prompt rules, and the structured-output schema, exposing a single function that takes vacancy text and returns a typed partial of the extractable fields (or a typed failure). A new `extractFromVacancy` tRPC procedure (auth + length cap, no rate limit yet) calls the service. A "Generate fields with AI" button appears below the vacancy textarea once it has content; clicking it calls the procedure, shows a loading state, and merges results into the form using empty-only semantics — never overwriting manual input. On error or empty result the form remains usable and an inline notice is shown near the button. This works on both the create and edit pages.

The prompt must instruct the model to extract only values literally present in the text (especially important for `jobUrl` and `sourceName`), to map varied work-mode phrasings to the enum, and to leave fields out of its response when they are not in the text.

This is the phase that delivers the headline value of the feature.

### Acceptance criteria

- [ ] The vacancy extraction service is implemented as a deep module: a single public function exposing typed input/output, encapsulating SDK setup, prompt, parsing, and error normalization.
- [ ] The `extractFromVacancy` tRPC procedure: requires auth, validates the 50k character cap, calls the service, returns a typed result.
- [ ] The Generate button only renders when the vacancy textarea is non-empty.
- [ ] Clicking Generate shows a loading state on the button (existing `LoadingButton` pattern).
- [ ] On success, the merge logic fills only fields that are currently empty; no manual edits are overwritten — including on the edit page when re-running extraction after editing the text.
- [ ] On extraction failure, the form remains fully usable and an inline notice is shown near the button.
- [ ] On an empty extraction (model returns no fields), the form is unchanged and an inline notice indicates nothing was extracted.
- [ ] `workMode` results are limited to the enum values (`remote` / `onsite` / `hybrid`).
- [ ] The Anthropic API key is read only from server env; nothing AI-related ships to the client.
- [ ] Tests for the extraction service exist and cover: presence and absence of each field, work-mode mapping across varied phrasings, empty input, SDK/network failures surfacing as a typed failure (not an unhandled exception).

---

## Phase 4: AI-filled badge

**User stories**: 6, 7

### What to build

Add a small visual marker on each field that was prefilled by the most recent AI extraction. The marker is purely client-side state — a set of field names tracked in the form. Successful extraction adds the names of the fields it filled. The marker on a given field clears as soon as the user edits that field's value. Nothing is persisted.

After this phase, after a Generate, the user can immediately see which fields to verify; once they touch a field, the hint disappears.

### Acceptance criteria

- [ ] Each field whose value came from the most recent AI extraction shows a visible "AI-filled" marker.
- [ ] Editing a field's value removes that field's marker immediately.
- [ ] Saving and reloading the application does not bring the marker back — it is session-only.
- [ ] Fields that the AI did not fill never display the marker.
- [ ] Fields the user filled manually before clicking Generate (and which were therefore not overwritten) do not display the marker.

---

## Phase 5: Rate limiting

**User stories**: 20, 21

### What to build

Protect the AI endpoint from runaway use. Build a small per-user sliding-window rate limiter as an in-memory helper, with tests covering window rollover and per-user isolation. Wire it into the `extractFromVacancy` procedure: 20 requests per user per hour. When the limit is hit, the procedure returns a typed error that the client surfaces as a clear inline notice ("You've hit the AI extraction limit; try again later"). The 50k character input cap (added in Phase 3) is documented here for completeness.

This phase has no new user-visible feature beyond the rejection message but closes the system-owner stories around cost and abuse.

### Acceptance criteria

- [ ] A rate-limiter helper exists with a small public surface (check / record) and per-user, per-key isolation.
- [ ] Tests cover: first N calls in a window allowed, (N+1)th rejected, calls allowed again after the window rolls over, counters isolated per user.
- [ ] The `extractFromVacancy` procedure returns a typed rate-limit error after 20 calls in the past hour for a given user.
- [ ] The client surfaces this error as an inline notice near the Generate button distinct from the generic failure notice.
- [ ] The limit can be tuned in code without a schema change.
- [ ] The plan documentation flags this as single-instance-only and notes that horizontal scaling will require a shared store.

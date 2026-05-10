# V4 — Vacancy Text & AI Field Extraction

## Problem Statement

When I add a new job application, I copy the same handful of details (company, title, salary, work mode) out of the vacancy posting and into the form by hand, every time. Each posting is laid out differently, so I have to scan the page, find each value, and retype it. It's tedious, slows down logging applications, and discourages me from tracking everything I apply to.

I also lose the original vacancy text the moment I close the listing. Later — when prepping for an interview, writing a cover letter, or just trying to remember what the role was — I have no record of what I actually applied to.

The current "Add Application" dialog also feels cramped: it's a small modal with several fields, and there's nowhere natural to paste a long vacancy posting. Editing has the same problem.

## Solution

Replace the Add and Edit dialogs with full pages. On the create page, alongside the existing fields, I can paste the entire vacancy text into a large textarea. Once there is text in the area, a "Generate fields with AI" button appears. Clicking it sends the vacancy text to Claude on the server, which extracts whatever it can find — company name, job title, salary, work mode, optionally job URL and source — and prefills the form fields for me. AI-filled fields are visually marked so I know which ones to double-check; the marker disappears the moment I edit a field. I can then save, and I'm returned to the applications table.

The vacancy text is stored on the application, so on the edit page I can see it again, re-paste, and re-run extraction. To protect manual edits, re-extraction only fills empty fields — it never overwrites values I've typed.

## User Stories

1. As a job seeker, I want to paste an entire vacancy posting into the Add Application form, so that I have a record of what I applied to without copying it elsewhere.
2. As a job seeker, I want the form fields to be auto-filled from the vacancy text on demand, so that I don't have to retype values that are already in the posting.
3. As a job seeker, I want the AI extraction to run only when I click a button, so that I control when an external API call is made and can paste/edit text without surprise behavior.
4. As a job seeker, I want the "Generate fields with AI" button to only appear when there is vacancy text to extract from, so that the UI stays uncluttered when the textarea is empty.
5. As a job seeker, I want to see a clear loading state while the AI is working, so that I know the click registered and roughly how long to wait.
6. As a job seeker, I want fields filled by the AI to be visually marked, so that I can spot which values came from the model and verify them before saving.
7. As a job seeker, I want the AI marker on a field to disappear as soon as I edit that field, so that I don't see stale "AI-filled" hints on values I've reviewed and changed.
8. As a job seeker, I want the AI to extract only values that literally appear in the vacancy text, so that it doesn't hallucinate a salary or company name when one isn't present.
9. As a job seeker, I want the AI to map varied phrasings ("Remote", "WFH", "Fully remote") to the right work-mode option, so that the dropdown is correctly set without my intervention.
10. As a job seeker, I want any AI extraction failure to leave the form fully usable with an inline notice, so that I can still save the application by filling fields manually.
11. As a job seeker, when I re-run extraction on the edit page after changing the vacancy text, I want only empty fields to be filled, so that my manual edits are never silently overwritten.
12. As a job seeker, I want a manual override at any time — typing in any field replaces whatever the AI suggested — so that I'm always in control of what gets saved.
13. As a job seeker, I want the Add Application action to take me to a dedicated page instead of opening a dialog, so that I have room for the vacancy text and don't feel constrained by a modal.
14. As a job seeker, I want clicking a row in the applications table to take me to a dedicated edit page, so that I have the same generous layout when revising an application.
15. As a job seeker, I want all fields on the edit page to be immediately editable when I open it, so that I don't need to click an extra "Edit" button to change something.
16. As a job seeker, I want to see and edit the original vacancy text on the edit page, so that I can re-extract or just re-read what I applied to.
17. As a job seeker, I want to be returned to the applications table after saving from either the new or the edit page, so that I can immediately see my updated list.
18. As a job seeker, I want the same status actions (Put On Hold, Resume Interviewing, Close Application) to remain available on the edit page, so that I haven't lost any functionality from the previous dialog.
19. As a job seeker, I want a Cancel option that takes me back to the table without saving, so that I can abandon a draft cleanly.
20. As the system owner, I want a per-user rate limit on the AI extraction endpoint, so that a single user can't run up an Anthropic bill or DOS the feature.
21. As the system owner, I want a length cap on the vacancy text submitted for extraction, so that a pasted novel doesn't blow up cost or latency.
22. As the system owner, I want the Anthropic API key to live only on the server, so that it is never shipped to the browser.
23. As a job seeker on a small screen, I want the new full pages to be more usable than a modal, so that adding and editing applications is comfortable on mobile.

## Implementation Decisions

### Schema

- Add a single `vacancyText` text column to the `JobApplication` table. Nullable.
- No HTML column at this stage. When a rich-text editor is added later, `vacancyHtml` will be added in the same migration that ships the editor.
- No per-field "AI-generated" flags in the database. The AI-filled marker is purely client-side, ephemeral, and clears on field edit.

### Routes & navigation

- New routes under `_authenticated/applications`:
  - `/applications/new` — create page.
  - `/applications/$id/edit` — edit page.
- The existing `add-application-dialog.tsx` and `edit-application-dialog.tsx` are deleted. The dialog approach is fully replaced — no fallback.
- The "Add Application" entry point navigates to `/applications/new`.
- Row interaction in the applications table that previously opened the edit dialog now navigates to `/applications/$id/edit`.
- Both pages return to the applications table on save and on cancel.

### Modules

- **Vacancy extraction service** (deep module): single public function that takes vacancy text and returns a typed partial of the extractable fields, or a typed failure. Encapsulates the Anthropic SDK client, tool/structured-output schema definition, system prompt, parsing, and error normalization. Callers never touch the SDK directly.
- **`jobApplication.extractFromVacancy` tRPC procedure**: thin wrapper — `protectedProcedure`, input validation (length cap), rate-limit check, calls the extraction service, returns the result.
- **Rate limiter**: small helper, per-user sliding-window counter, in-memory. Adequate for a single Railway instance; if the deployment ever scales horizontally, this needs to move to a shared store (DB or Redis).
- **DB migration**: adds `vacancyText`. The existing `jobApplication.create` and `jobApplication.update` procedures are extended to accept it.
- **Shared `ApplicationForm` component**: takes a `mode` ("create" | "edit"), initial values, and a submit callback. Owns form state, AI-filled tracking (a Set of field names), the vacancy textarea, the Generate button, the per-field badge, and the inline error notice slot. Status actions (On Hold / Resume / Close) only render in edit mode.
- **Client hook for AI extraction**: wraps the tRPC mutation; manages loading state, fills only empty fields into the form on success, surfaces errors to the inline notice.

### AI behavior

- Model: Claude Haiku 4.5.
- Stack: `@anthropic-ai/sdk` directly, server-side, with tool use / structured output to get a typed JSON object back. The TanStack AI adapter is not used — it's designed for streaming chat with tool loops and is overkill for one-shot extraction.
- Fields targeted by the prompt: `companyName`, `jobTitle`, `salary`, `workMode`, `jobUrl`, `sourceName`.
- Prompt rule: extract only values literally present in the text; do not guess or infer. This is critical for `jobUrl` and `sourceName`, which rarely appear in vacancy bodies.
- `salary` is stored as the raw string the model extracts (no normalization at this stage).
- `workMode` is mapped to the existing enum values (`remote` / `onsite` / `hybrid`).
- Fill policy on the client: only overwrite empty fields. Manual edits are never replaced.
- On error or empty result: the form remains fully usable, an inline notice is shown near the Generate button.

### Constraints / defaults

- Vacancy text length cap: 50,000 characters. Enforced in the tRPC input schema. Generous for any realistic posting.
- AI extraction rate limit: 20 requests per user per hour (default — tune after observing usage).
- Anthropic API key lives in server environment only.

### Edit-page behaviors

- All fields editable on open — no preview/edit toggle.
- The vacancy textarea is shown with the saved text and is editable; clicking Generate again triggers extraction with the only-fill-empty-fields policy.
- Existing status actions are preserved on the edit page.

## Testing Decisions

A good test exercises the public interface of a module and asserts on observable outputs, not on internal state, helper calls, or the shape of intermediate data. Tests should survive refactors that don't change behavior.

Modules that get tests:

- **Vacancy extraction service**. Fixture-based tests over a small set of crafted vacancy snippets — realistic, varied formats, including ones that omit several fields. Assertions:
  - When a field is present in the text, it is extracted with a sensible value.
  - When a field is absent, it is absent from the result (no hallucination).
  - `workMode` correctly maps varied phrasings to the enum.
  - Empty input returns an empty result without throwing.
  - SDK / network failures surface as a typed failure, not an unhandled exception.
  - Decision deferred to implementation: real Haiku calls vs. mocked SDK. Real calls give signal on prompt quality but cost money and are non-deterministic; mocks are deterministic but don't validate the prompt.
- **Rate limiter**. Pure logic — fast, deterministic. Assertions:
  - First N calls within the window are allowed.
  - The (N+1)th call within the window is rejected.
  - Calls after the window has rolled over are allowed again.
  - Counters are isolated per user.

Modules that do not get tests at this stage:

- **tRPC `extractFromVacancy` procedure**. Could be tested for the wiring (auth, input cap, rate-limit integration) but skipped for now to keep scope tight; the underlying parts are already covered.
- **`ApplicationForm` component**. UI state transitions (badge clearing, AI-filled tracking) — high churn, lower value at this stage.
- **New routes**. Loaders are thin.

Prior art for tests in this repo: `packages/api` and `apps/tanstack-start` should be checked at implementation time for the existing test runner, fixture conventions, and any tRPC test utilities already in place; tests for these new modules should follow whatever pattern is already used, rather than introduce a new framework.

## Out of Scope

- Rich-text editor for vacancy text. The textarea is plain text only. The HTML column will be added when the editor is.
- AI features beyond field extraction (cover letter generation, interview prep, resume tailoring, etc.).
- Auto-extraction on paste. Extraction is always user-initiated.
- Diff/confirmation UI when re-running extraction. The "only fill empty fields" rule eliminates the need for it.
- Persisted "AI-generated" flags on fields across sessions. The badge is ephemeral by design.
- Multi-instance-safe rate limiting. The in-memory limiter assumes a single Railway instance; revisit when/if the deployment scales out.
- Salary normalization (currency parsing, range splitting, etc.). Stored as the raw string for now.
- Bulk import of multiple vacancies at once.
- Browser extension or other mechanisms for capturing vacancy text directly from a job site.

## Further Notes

- The applications table itself (columns, filtering, pagination) is unchanged by this PRD. Only the entry/exit points to and from create/edit change.
- Deleting the dialog components removes the only consumers of a few imports — implementation should be alert to dead code in their wake.
- The AI-filled marker is the most flexible piece of UX in this PRD. It can start as a small text label or icon next to the field; visual treatment can iterate without any data-model changes.
- If the rate limit turns out to be too generous or too strict, it can be tuned in code without a schema change.
- The `vacancyText` column being nullable means existing applications continue to work untouched and the migration is non-destructive.

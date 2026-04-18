# Refactor: Applications Page

## Problem Statement

The applications page (`routes/_authenticated/applications/index.tsx`) is a single ~1,519-line file containing the route component plus eleven supporting components (`EmptyState`, `StatusBadge`, `ClosedReasonBadge`, `PaginationControls`, `ApplicationsTable`, `HistoryTable`, `SourceTypeahead`, `AddApplicationDialog`, `EditApplicationDialog` + `EditApplicationForm`, `CloseApplicationDialog`, `InterviewsDialog`) and every query/mutation in the feature inlined. Data-fetching, table definitions, dialog UIs, and small presentational badges are all tangled together, making the file hard to navigate, review, and maintain.

## Solution

Restructure the file into a TanStack Router-idiomatic `applications/` directory using the `-` prefix convention for colocated non-route files. Extract components one-per-file into `-components/` and extract data hooks one-per-file into `-hooks/`, following the exact pattern already used for the steps settings page refactor (`refactor/steps-settings-page.md`). Keep Add and Edit dialogs separate, keep the two tables separate, keep the two badges separate, and leave the `InterviewsDialog` as a single file. Dialog open/close stays in local page state (no route search params).

## Commits

### Phase 1: Restructure into `applications/` directory

**Commit 1 — Convert `applications.tsx` to `applications/index.tsx` with empty subdirectories**

The file has already been moved from `applications.tsx` to `applications/index.tsx` locally. Finalize that move and create the empty `-components/` and `-hooks/` directories inside `applications/`. No imports or code change. Verify the app compiles and the route still works.

### Phase 2: Extract small presentational components

**Commit 2 — Extract `EmptyState` into `-components/empty-state.tsx`**

Move the `EmptyState` component verbatim into its own file. Update `applications/index.tsx` to import it. Verify compilation.

**Commit 3 — Extract `StatusBadge` into `-components/status-badge.tsx`**

Move `StatusBadge` verbatim, including the label/color maps defined inside it. Update both `applications/index.tsx` and any remaining local callers to import it. Verify compilation.

**Commit 4 — Extract `ClosedReasonBadge` into `-components/closed-reason-badge.tsx`**

Move `ClosedReasonBadge` and the `CLOSED_REASON_LABELS` constant verbatim into its own file. Update imports. Verify compilation.

**Commit 5 — Extract `PaginationControls` into `-components/pagination-controls.tsx`**

Move `PaginationControls` verbatim. Update imports. Verify compilation.

### Phase 3: Extract the source typeahead

**Commit 6 — Extract `SourceTypeahead` into `-components/source-typeahead.tsx`**

Move `SourceTypeahead` verbatim, including its inline `useQuery` for `trpc.source.search`. Update both dialog callers (Add and Edit) to import it. Verify compilation. (The source-search query stays inside the component for now; it will be swapped for a hook in Phase 6.)

### Phase 4: Extract tables

**Commit 7 — Extract `ApplicationsTable` into `-components/applications-table.tsx`**

Move `ApplicationsTable`, the `ApplicationRow` interface, the `columnHelper`, and the `createColumns` factory together into a single file. The component continues to take the same `data`, `onEdit`, `onInterviews` props. Update `applications/index.tsx` to import it. Verify compilation.

**Commit 8 — Extract `HistoryTable` into `-components/history-table.tsx`**

Move `HistoryTable`, the `HistoryRow` interface, `historyColumnHelper`, and `historyColumns` together into a single file. Update `applications/index.tsx` to import it. Verify compilation.

### Phase 5: Extract dialogs

**Commit 9 — Extract `AddApplicationDialog` into `-components/add-application-dialog.tsx`**

Move `AddApplicationDialog` verbatim. Update `applications/index.tsx` to import it. No logic changes (the mutation stays inline for now — it moves to a hook in Phase 6). Verify compilation.

**Commit 10 — Extract `EditApplicationDialog` into `-components/edit-application-dialog.tsx`**

Move both `EditApplicationDialog` and its inner `EditApplicationForm` together into one file. Update `applications/index.tsx` to import `EditApplicationDialog`. Verify compilation.

**Commit 11 — Extract `CloseApplicationDialog` into `-components/close-application-dialog.tsx`**

Move `CloseApplicationDialog` and the `CLOSED_REASONS` constant verbatim. Update imports. Verify compilation.

**Commit 12 — Extract `InterviewsDialog` into `-components/interviews-dialog.tsx`**

Move `InterviewsDialog`, the `INTERVIEW_TYPE_LABELS` constant, and the `InterviewType` type alias together into one file. The internal add/inline-edit form stays inside the same file. Update imports. Verify compilation.

### Phase 6: Extract data hooks

**Commit 13 — Extract `useActiveApplications` into `-hooks/use-active-applications.ts`**

Create the hook wrapping `useSuspenseQuery(trpc.jobApplication.list.queryOptions({ ..., tab: "active" }))`. Accepts the composed input object. Update `applications/index.tsx` to use the hook. Verify compilation.

**Commit 14 — Extract `useClosedApplications` into `-hooks/use-closed-applications.ts`**

Create the hook wrapping `useQuery(trpc.jobApplication.list.queryOptions({ ..., tab: "closed" }, { enabled }))`. Accepts the input object and an `enabled` flag. Update `applications/index.tsx`. Verify compilation.

**Commit 15 — Extract `useApplication` into `-hooks/use-application.ts`**

Create the hook wrapping `useQuery(trpc.jobApplication.byId.queryOptions({ id }, { enabled: !!id }))`. Accepts a nullable id. Update `EditApplicationDialog` to use it. Verify compilation.

**Commit 16 — Extract `useSourceSearch` into `-hooks/use-source-search.ts`**

Create the hook wrapping `useQuery(trpc.source.search.queryOptions({ query }, { enabled }))`. Update `SourceTypeahead` to use it. Verify compilation.

**Commit 17 — Extract `useCreateApplication` into `-hooks/use-create-application.ts`**

Create the hook wrapping the `jobApplication.create` mutation with its `onSuccess` (invalidate `jobApplication` + `source`, toast "Application added!") and `onError` (toast error). Accept an `onSuccess` callback parameter so the dialog can close and reset the form. Update `AddApplicationDialog` to use it. Verify compilation.

**Commit 18 — Extract `useUpdateApplication` into `-hooks/use-update-application.ts`**

Create the hook wrapping the `jobApplication.update` mutation with invalidation and toast. Accept an `onSuccess` callback. Update `EditApplicationForm` (all three call sites: save, put-on-hold, resume-interviewing) to use it. Verify compilation.

**Commit 19 — Extract `useCloseApplication` into `-hooks/use-close-application.ts`**

Create the hook wrapping the `jobApplication.close` mutation with invalidation and toast. Accept an `onSuccess` callback. Update `CloseApplicationDialog` to use it. Verify compilation.

**Commit 20 — Extract `useInterviews` into `-hooks/use-interviews.ts`**

Create the hook wrapping `useQuery(trpc.interview.list.queryOptions({ jobApplicationId }, { enabled }))`. Update `InterviewsDialog` to use it. Verify compilation.

**Commit 21 — Extract `useCreateInterview` into `-hooks/use-create-interview.ts`**

Create the hook wrapping the `interview.create` mutation with its shared invalidation (both `interview` and `jobApplication` path filters) and toast. Accept an `onSuccess` callback. Update `InterviewsDialog` to use it. Verify compilation.

**Commit 22 — Extract `useUpdateInterview` into `-hooks/use-update-interview.ts`**

Create the hook wrapping the `interview.update` mutation with invalidation and toast. Accept an `onSuccess` callback. Update `InterviewsDialog`. Verify compilation.

**Commit 23 — Extract `useDeleteInterview` into `-hooks/use-delete-interview.ts`**

Create the hook wrapping the `interview.delete` mutation with invalidation and toast. Update `InterviewsDialog`. Verify compilation.

### Phase 7: Clean up the page component

**Commit 24 — Final cleanup of `applications/index.tsx`**

With all components and hooks extracted, the page component should be a thin shell: route definition, loader, top-level state (tabs, page, filters, debounced search, dialog-open ids), and a composition of the extracted components. Review for any leftover unused imports. Verify compilation and a full manual pass of all flows (see Testing Decisions).

## Decision Document

- **Directory structure**: TanStack Router's `-` prefix convention. Route file is `applications/index.tsx`. Supporting files go in `applications/-components/` and `applications/-hooks/`. The `-` prefix excludes these folders from route generation while keeping them importable.
- **Component granularity**: One component per file. Components that are logically paired (e.g., a table + its row type + its column definitions; a dialog + its inner form) stay in the same file. `EditApplicationDialog` keeps its inner `EditApplicationForm` alongside it. `InterviewsDialog` keeps its inline add/edit forms alongside it.
- **Hook granularity**: One hook per mutation or query. The two list queries (active/closed) become two separate hooks rather than one combined hook, since they have different query semantics (suspense vs. conditional lazy) and different input shapes.
- **No unification this pass**: Keep `AddApplicationDialog` and `EditApplicationDialog` as two distinct components. Keep `ApplicationsTable` and `HistoryTable` as two distinct components. Keep `StatusBadge` and `ClosedReasonBadge` as two distinct components. The goal of this refactor is file-structure cleanup, not API consolidation.
- **Dialog state stays local**: Dialog open/close state (`showAddDialog`, `editingAppId`, `closingAppId`, `interviewsAppId`) remains in `useState` on the page component. No migration to route search params.
- **Hook callback pattern**: Mutation hooks that need caller-specific side effects (closing a dialog, resetting a form, clearing an editing id) accept an `onSuccess` callback parameter, keeping the hook reusable while letting the caller control UI-specific behavior. Matches the pattern from `refactor/steps-settings-page.md`.
- **Shared invalidation in `useCreateInterview` / `useUpdateInterview` / `useDeleteInterview`**: Each interview mutation hook invalidates both `interview` and `jobApplication` path filters inline (no helper extracted). The existing `invalidate` helper inside `InterviewsDialog` disappears.
- **Search debouncing stays on the page**: The `searchTimerRef` + `handleSearchChange` debounce logic stays in the page component. It's specific to the page's search UX and not reused elsewhere.
- **No barrel exports**: Each file is imported directly by path. No `index.ts` re-export files in `-components/` or `-hooks/`.

## Testing Decisions

- **No new tests**: There are no frontend tests in the tanstack-start app. This refactor is purely structural (no behavior changes), so we rely on TypeScript compilation and manual verification. Matches the decision from the steps refactor.
- **Manual verification checklist** (run after each commit, full sweep after Commit 24):
  - App compiles without errors.
  - Applications page loads; Active tab shows active applications.
  - Add Application dialog opens, creates a new application, closes, and the list updates. Source typeahead works (search, select existing, create new, clear).
  - Clicking a company name in the Active table opens the Edit dialog with pre-populated values. Save updates the row. Put On Hold / Resume Interviewing / Close Application buttons each trigger the correct flow.
  - Close Application dialog opens from the Edit dialog, all four closed reasons render with tooltips, submitting closes the application and moves it to History.
  - History tab loads lazily only when selected, shows closed applications, and displays the correct outcome badge colors.
  - Search debounce works on both tabs; status filter works on the Active tab only.
  - Pagination works on both tabs when there are enough results.
  - Interviews dialog opens from the Active table, lists existing interviews, allows add/edit/delete, and the application row's interview count updates on close.

## Out of Scope

- Unifying `AddApplicationDialog` and `EditApplicationDialog` into a single mode-driven form.
- Unifying `ApplicationsTable` and `HistoryTable` into a generic table component.
- Unifying `StatusBadge` and `ClosedReasonBadge` into one badge component.
- Splitting `InterviewsDialog` into smaller sub-components (`InterviewListItem`, `InterviewForm`, etc.).
- Moving dialog open/close state into route search params (shareable URLs, browser-back support).
- Splitting `useActiveApplications` / `useClosedApplications` into a single combined `useJobApplications` hook.
- Adding any frontend tests.
- Changing the tRPC router or API contracts.
- Changing any visual behavior, copy, or styling.
- Refactoring other pages that share any of these components/queries (e.g., teams pages, progress page).

## Further Notes

- The prior refactor for the steps settings page (`refactor/steps-settings-page.md`) is the template for this one. If any decision here feels ambiguous during implementation, follow the steps precedent.
- After Commit 24, the page component should read cleanly as an orchestration layer: state, composition, and delegation. If any commit leaves the page meaningfully longer or harder to read than the previous commit, pause and reconsider.

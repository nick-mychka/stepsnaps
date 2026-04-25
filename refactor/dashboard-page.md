# Refactor: Dashboard Page

## Problem Statement

The dashboard page (`routes/_authenticated/dashboard.tsx`) is a single 363-line file containing the route component plus five supporting components (`StatsRow`, `StreakCard`, `ActiveJourneyCard`, `StartJourneyCard`, `FinishJourneyDialog`), every query/mutation in the feature inlined, a `getGreeting` helper, and an explicitly-temporary background picker (`BG_VARIANTS` array, eleven background-component imports, and the picker UI). Data-fetching, dialog UI, presentational cards, a pure helper, and scratch UI are all tangled together, making the file hard to navigate and review.

## Solution

Restructure the file into a TanStack Router-idiomatic `dashboard/` directory using the `-` prefix convention for colocated non-route files. Extract components one-per-file into `-components/`, extract data hooks one-per-file into `-hooks/`, and extract the pure greeting helper into `-utils/`. Follow the exact pattern already used for the steps settings page refactor (`refactor/steps-settings-page.md`) and the applications page refactor (`refactor/applications-page.md`). Move the temporary background picker into its own component to isolate the scratch UI without removing it.

## Commits

### Phase 1: Restructure into `dashboard/` directory

**Commit 1 — Convert `dashboard.tsx` to `dashboard/index.tsx` with empty subdirectories**

Create the `dashboard/` directory as a sibling to where `dashboard.tsx` currently lives. Move `dashboard.tsx` to `dashboard/index.tsx`. Create the empty `-components/`, `-hooks/`, and `-utils/` directories inside `dashboard/`. No imports or code change — just the file move. TanStack Router treats `dashboard/index.tsx` identically to `dashboard.tsx` for route generation, and `-` prefixed folders are excluded from the route tree. Verify the app compiles and the route still works.

### Phase 2: Extract the pure helper

**Commit 2 — Extract `getGreeting` into `-utils/get-greeting.ts`**

Move the `getGreeting` function verbatim into its own file. Update `dashboard/index.tsx` to import it. No logic changes. Verify compilation.

### Phase 3: Extract the temporary background picker

**Commit 3 — Extract `BackgroundPicker` into `-components/background-picker.tsx`**

Move the `BG_VARIANTS` array, all eleven `BackgroundV*` imports, and the entire "Temporary background picker" UI block (the `<div className="mt-10 max-w-xl">…</div>` block) into a single file. The component accepts `activeBg` and `onChange` props; `BG_VARIANTS` is exported from the same file so the page can still resolve the active background component. Update `dashboard/index.tsx` to import both `BG_VARIANTS` and `BackgroundPicker`, keep the `activeBg` `useState` and the `<ActiveBg />` render at the page top, and replace the inline picker block with `<BackgroundPicker activeBg={activeBg} onChange={setActiveBg} />`. Verify compilation and that the picker still switches backgrounds.

### Phase 4: Extract presentational and dialog components

**Commit 4 — Extract `StreakCard` into `-components/streak-card.tsx`**

Move the `StreakCard` function verbatim into its own file. Update `dashboard/index.tsx` to import it. No logic changes. Verify compilation.

**Commit 5 — Extract `StatsRow` into `-components/stats-row.tsx`**

Move the `StatsRow` function verbatim into its own file. It continues to import `StreakCard` from `./streak-card` and continues to call `useSuspenseQuery(trpc.snap.list.queryOptions({ journeyId }))` directly (the query moves to a hook in Phase 5). Update `dashboard/index.tsx` to import `StatsRow`. Verify compilation.

**Commit 6 — Extract `FinishJourneyDialog` into `-components/finish-journey-dialog.tsx`**

Move the `FinishJourneyDialog` function verbatim into its own file. The `journey.finish` mutation stays inline for now (it moves to a hook in Phase 5). Update `dashboard/index.tsx` to import it. Verify compilation.

**Commit 7 — Extract `ActiveJourneyCard` into `-components/active-journey-card.tsx`**

Move the `ActiveJourneyCard` function verbatim into its own file. It imports `FinishJourneyDialog` from `./finish-journey-dialog`. Update `dashboard/index.tsx` to import `ActiveJourneyCard`. Verify compilation.

**Commit 8 — Extract `StartJourneyCard` into `-components/start-journey-card.tsx`**

Move the `StartJourneyCard` function verbatim into its own file. The `journey.start` mutation stays inline for now (it moves to a hook in Phase 5). Update `dashboard/index.tsx` to import it. Verify compilation.

### Phase 5: Extract data hooks

**Commit 9 — Extract `useActiveJourney` into `-hooks/use-active-journey.ts`**

Create the hook wrapping `useSuspenseQuery(trpc.journey.active.queryOptions())`. Update `dashboard/index.tsx` to use the hook instead of the inline query. Verify compilation.

**Commit 10 — Extract `useJourneySnaps` into `-hooks/use-journey-snaps.ts`**

Create the hook wrapping `useSuspenseQuery(trpc.snap.list.queryOptions({ journeyId }))`. Accepts `journeyId` as an argument. Update `StatsRow` to use the hook. Verify compilation.

**Commit 11 — Extract `useStartJourney` into `-hooks/use-start-journey.ts`**

Create the hook wrapping the `journey.start` mutation with its `onSuccess` (invalidate `journey` path filter, toast "Journey started!") and `onError` (toast error). Update `StartJourneyCard` to use it. Verify compilation.

**Commit 12 — Extract `useFinishJourney` into `-hooks/use-finish-journey.ts`**

Create the hook wrapping the `journey.finish` mutation with its `onSuccess` (invalidate `journey` path filter, toast "Journey completed! Congrats!") and `onError` (toast error). Accept an `onSuccess` callback parameter so the dialog can close itself. Update `FinishJourneyDialog` to use it. Verify compilation.

### Phase 6: Clean up the page component

**Commit 13 — Final cleanup of `dashboard/index.tsx`**

With all components, hooks, and the helper extracted, the page component should be a thin shell: route definition, loader, top-level state (`activeBg`), greeting computation, and a composition of `<ActiveBg />`, the greeting heading + `StatsRow`, the conditional `ActiveJourneyCard` / `StartJourneyCard`, and `BackgroundPicker`. Review for any leftover unused imports. Verify compilation and a full manual pass of all flows (see Testing Decisions).

## Decision Document

- **Directory structure**: TanStack Router's `-` prefix convention. Route file becomes `dashboard/index.tsx`. Supporting files go in `dashboard/-components/`, `dashboard/-hooks/`, and `dashboard/-utils/`. The `-` prefix excludes these folders from route generation while keeping them importable.
- **`-utils/` folder**: New for this refactor. Holds pure helpers that aren't components or hooks. Currently a single occupant (`get-greeting.ts`). Same `-` prefix rule applies.
- **Component granularity**: One component per file (`streak-card.tsx`, `stats-row.tsx`, `active-journey-card.tsx`, `start-journey-card.tsx`, `finish-journey-dialog.tsx`, `background-picker.tsx`). `StreakCard` lives in its own file even though `StatsRow` is its only consumer — this matches the existing one-per-file precedent.
- **Hook granularity**: One hook per mutation/query (`use-active-journey.ts`, `use-journey-snaps.ts`, `use-start-journey.ts`, `use-finish-journey.ts`). `useJourneySnaps` is dashboard-local even though `trpc.snap.list` is used by other pages — extracting a shared hook is out of scope.
- **No unification**: `ActiveJourneyCard` and `StartJourneyCard` stay as two distinct components. The goal of this refactor is file-structure cleanup, not API consolidation.
- **Background picker stays, but isolated**: The `── Temporary background picker ──` block is moved into `background-picker.tsx` rather than deleted. The picker accepts `activeBg` and `onChange` props; `BG_VARIANTS` is exported from the same file so the page can resolve `ActiveBg` for the page-level background render. `activeBg` `useState` stays on the page (the page renders `<ActiveBg />` at the top, the picker mutates the state).
- **Hook callback pattern**: Mutation hooks that need caller-specific side effects (closing a dialog) accept an `onSuccess` callback parameter. `useFinishJourney` uses this so the dialog can close itself; `useStartJourney` does not need one. Matches the pattern from `refactor/steps-settings-page.md` and `refactor/applications-page.md`.
- **No barrel exports**: Each file is imported directly by path. No `index.ts` re-export files in `-components/`, `-hooks/`, or `-utils/`.

## Testing Decisions

- **No new tests**: There are no frontend tests in the tanstack-start app. This refactor is purely structural (no behavior changes), so we rely on TypeScript compilation and manual verification. Matches the decision from the steps and applications refactors.
- **Manual verification checklist** (run after each commit, full sweep after Commit 13):
  - App compiles without errors.
  - Dashboard loads. Greeting renders with the correct time-of-day variant and first name.
  - With no active journey: `StartJourneyCard` renders. Clicking "Start Journey" creates a journey, the card swaps to `ActiveJourneyCard`, and the toast fires.
  - With an active journey: `ActiveJourneyCard` renders with the correct start date and day count. Streak card shows the correct day count.
  - Clicking the actions menu → "Finish Journey" opens `FinishJourneyDialog`. Submitting (with or without company/offer details) finishes the journey, closes the dialog, fires the toast, and the card swaps back to `StartJourneyCard`.
  - Clicking "Log Today's Snap" navigates to `/snap/new`.
  - Background picker renders all variants, clicking a variant swaps the page background, the selected variant shows the active border style.

## Out of Scope

- Removing or replacing the temporary background picker. The picker is preserved verbatim, just moved into its own file.
- Persisting the user's selected background across reloads (e.g., localStorage, user settings, route search param).
- Extracting `useJourneySnaps` to a shared hook usable by other pages that query `trpc.snap.list`.
- Moving `getGreeting` to a shared `~/lib/` location.
- Unifying `ActiveJourneyCard` and `StartJourneyCard` into a single mode-driven card.
- Migrating the `FinishJourneyDialog` open state to a route search param.
- Adding any frontend tests.
- Changing the tRPC router or API contracts.
- Changing any visual behavior, copy, or styling.

## Further Notes

- The prior refactors for the steps settings page (`refactor/steps-settings-page.md`) and applications page (`refactor/applications-page.md`) are the templates for this one. If any decision here feels ambiguous during implementation, follow that precedent.
- After Commit 13, the page component should read cleanly as an orchestration layer: state, composition, and delegation. If any commit leaves the page meaningfully longer or harder to read than the previous commit, pause and reconsider.

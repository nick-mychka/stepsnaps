# Refactor: Snap New Page

## Problem Statement

The new-snap page (`routes/_authenticated/snap/new.tsx`) is a single ~230-line file containing two components (`SnapFormPage`, `SnapForm`), all data-fetching, all mutation logic, a tricky lazy-init form-state pattern, and inline numeric-vs-text field rendering inside a `.map()` body. Data, state, and presentation are tangled together in a single component, mirroring the same shape that motivated the steps settings refactor.

## Solution

Restructure `new.tsx` into a TanStack Router-idiomatic `new/` directory using the `-` prefix convention for colocated non-route files. Extract components one-per-file into `-components/`, extract data hooks one-per-file into `-hooks/`, lift the page component into a sibling `-snap-form-page.tsx` (parallel to the existing `-steps-page.tsx` pattern), and unify the numeric/text field rendering into a single mode-driven `SnapFormField`.

## Commits

### Phase 1: Restructure into `new/` directory

**Commit 1 — Convert `new.tsx` to `new/index.tsx` with no code changes**

Create the `new/` directory as a sibling to where `new.tsx` currently lives. Move `new.tsx` to `new/index.tsx`. Create the empty `-components/` and `-hooks/` directories inside `new/`. No imports or code change — just the file move. TanStack Router treats `new/index.tsx` identically to `new.tsx` for route generation, and `-` prefixed folders are excluded from the route tree. Verify the app compiles and the `/snap/new` route still works.

### Phase 2: Extract components one-per-file

**Commit 2 — Extract `SnapForm` into `-components/snap-form.tsx`**

Move the `SnapForm` function verbatim into its own file. Update `new/index.tsx` to import it. No logic changes. Verify compilation.

**Commit 3 — Lift `SnapFormPage` into `-snap-form-page.tsx`, slim `index.tsx` to a route shell**

Move the `SnapFormPage` function into a sibling file `-snap-form-page.tsx` (parallel to the existing `-steps-page.tsx` pattern in settings/steps). `index.tsx` becomes a thin route shell containing only `createFileRoute`, the loader (with the same prefetches), and `component: SnapFormPage` imported from `./-snap-form-page`. Verify compilation and that the no-active-journey empty state still renders correctly.

### Phase 3: Unify the numeric vs text field rendering

**Commit 4 — Extract `SnapFormField` into `-components/snap-form-field.tsx`**

Create `-components/snap-form-field.tsx` with a single `SnapFormField` component that owns the per-step field rendering currently inlined in `SnapForm`'s `.map()`. The component:

- Receives the step definition, the current string value, the snapshot goal value (from the existing snap, if any), and an `onChange` callback.
- Branches internally on `stepDefinition.type === "numeric"`:
  - **Numeric**: renders the `Input` (number, min=0, step=any), and the `Progress` + "X of Y" caption when a positive goal is present.
  - **Text**: renders the `Textarea`.
- The label (`FieldLabel`) and `Field` wrapper move into the component.
- The goal-resolution logic (snapshot goal → step def goal → numeric coercion) and the `numericVal` derivation move with it.

Update `SnapForm` to render `<SnapFormField key={sd.id} stepDefinition={sd} value={...} snapGoalValue={...} onChange={...} />` inside its `.map()`. Verify compilation; confirm visually that numeric progress bars and text inputs both still behave identically.

### Phase 4: Extract data hooks

**Commit 5 — Extract `useActiveJourney` hook into `-hooks/use-active-journey.ts`**

Create the hook wrapping `useSuspenseQuery(trpc.journey.active.queryOptions())`. Update `-snap-form-page.tsx` to use it instead of inline query code. Verify compilation.

**Commit 6 — Extract `useActiveStepDefinitions` hook into `-hooks/use-active-step-definitions.ts`**

Create the hook wrapping `useSuspenseQuery(trpc.stepDefinition.active.queryOptions())`. Naming includes "Active" to disambiguate from the `useStepDefinitions` hook in the steps settings folder, which wraps the `.list` query. Update `SnapForm` to use it. Verify compilation.

**Commit 7 — Extract `useExistingSnap` hook into `-hooks/use-existing-snap.ts`**

Create the hook accepting `journeyId` and wrapping `useQuery(trpc.snap.byDate.queryOptions({ journeyId, date: today() }))`. Returns the full query result so callers retain access to both `data` and `isLoading`. Update `SnapForm` to use it. Verify compilation.

**Commit 8 — Extract `useUpsertSnap` hook into `-hooks/use-upsert-snap.ts`**

Create the hook wrapping the `snap.upsert` mutation with its `onSuccess` (invalidate `snap` queries, toast) and `onError` (toast error). Accept an options object `{ wasUpdate: boolean; onSuccess?: () => void }`:

- `wasUpdate` controls the toast text ("Snap updated!" vs "Snap created!").
- `onSuccess` lets the caller hook in side effects like navigation, mirroring the `useCreateStep` callback pattern from the steps refactor.

Update `SnapForm` to use the hook, passing `wasUpdate: !!existingSnap` and an `onSuccess` callback that navigates to `/dashboard`. Verify compilation.

### Phase 5: Extract the form-init state pattern

**Commit 9 — Extract `useSnapFormValues` hook into `-hooks/use-snap-form-values.ts`**

The current code uses a `useState<Record<string, string>>({})` plus a separate `initialized` flag plus an `if (!initialized && !isLoadingSnap)` block during render to lazily seed the form once the existing snap loads. Encapsulate this entire pattern in a hook that accepts `existingSnap` and `isLoadingSnap` and returns `{ values, setValues, initialized }`. Internal logic and seeding rules (numeric → `numericValue`, text → `textValue`, fallback to empty string) move into the hook unchanged. Update `SnapForm` to use it. Verify compilation; confirm the loading placeholder still appears on first paint and the form populates correctly when editing today's existing snap.

### Phase 6: Final cleanup

**Commit 10 — Final cleanup of `snap-form.tsx` and `index.tsx`**

With all components and hooks extracted, `SnapForm` should be a thin shell: pull data from the four hooks, derive `snapValues` for submit, render the `Card`/`form` chrome and a `.map()` of `SnapFormField`s. Remove any leftover unused imports across `index.tsx`, `-snap-form-page.tsx`, and `-components/snap-form.tsx`. Verify compilation and full manual test of all flows (empty journey state, new snap, editing today's existing snap, numeric progress, text fields, submit + navigate).

## Decision Document

- **Directory structure**: TanStack Router's `-` prefix convention. Route file becomes `new/index.tsx` (a thin shell). Supporting files go in `new/-components/` and `new/-hooks/`. The page component sits in `new/-snap-form-page.tsx` as a sibling, mirroring the actual end state of the steps settings refactor where the page component lives in `-steps-page.tsx` and `index.tsx` is route-only.
- **Component granularity**: One component per file (`snap-form.tsx`, `snap-form-field.tsx`).
- **Unified field component**: A single `SnapFormField` with internal branching on `stepDefinition.type` replaces the inline numeric-vs-text rendering inside `.map()`. This is the analogue of the unified `StepFormDialog` from the steps refactor — a single component owns both presentation modes.
- **Hook granularity**: One hook per query/mutation (`use-active-journey.ts`, `use-active-step-definitions.ts`, `use-existing-snap.ts`, `use-upsert-snap.ts`), plus one hook (`use-snap-form-values.ts`) for the lazy-init form-state pattern.
- **Hook callback pattern**: `useUpsertSnap` accepts `{ wasUpdate, onSuccess }` so the toast text is parameterized and the caller controls the navigation side effect — mirroring how `useCreateStep` accepts `onSuccess` to close the dialog.
- **`useExistingSnap` returns the full query result**: Callers need both `data` (to seed the form) and `isLoading` (to gate the lazy init). Returning the raw query keeps the hook trivially thin.
- **`useSnapFormValues` owns the init-once pattern**: Lifting `useState` + the `initialized` guard + the seeding rules into a hook isolates the trickiest piece of state logic in the file. The page component no longer needs to know about lazy initialization.
- **Hook naming disambiguation**: `useActiveStepDefinitions` rather than `useStepDefinitions` because the steps settings folder already has a hook by the latter name wrapping a different query (`.list` vs `.active`). The `-hooks/` folder is route-scoped, so technically there is no name collision, but distinct names prevent confusion when reading either file.
- **No barrel exports**: Each file is imported directly by path. No `index.ts` re-export files in `-components/` or `-hooks/`.
- **Submit transformation stays in the page**: The `stepDefinitions.map(...)` that builds `snapValues` for the mutation is small and depends on both `stepDefinitions` and `values`; it stays inline in `SnapForm` rather than moving into the upsert hook.
- **Loader stays unchanged**: The route loader in `index.tsx` continues to prefetch `journey.active` and `stepDefinition.active`. Suspense behavior is preserved.

## Testing Decisions

- **No new tests**: There are no frontend tests in the app currently. This refactor is purely structural (no behavior changes), so we rely on TypeScript compilation and manual verification — the same approach taken by the steps settings refactor.
- **Manual verification checklist**:
  - App compiles without errors after each commit
  - `/snap/new` route loads
  - With no active journey: the empty state renders with the "Go to Dashboard" button
  - With an active journey and no snap for today: form renders with empty inputs, "New Snap" title, "Save Snap" button
  - With an active journey and an existing snap for today: form pre-populates with existing values, "Edit Today's Snap" title, "Update Snap" button
  - Numeric fields show the progress bar and "X of Y" caption when a positive goal exists; do not show progress when goal is missing or zero
  - Text fields render as a `Textarea`
  - Submitting creates/updates the snap, fires the correct toast ("Snap created!" / "Snap updated!"), and navigates to `/dashboard`
  - Submitting with errors shows the error toast

## Out of Scope

- Refactoring other pages that consume snap or step-definition queries (e.g., `progress.tsx`, `dashboard`, `teams/`). They have their own concerns and can be addressed separately.
- Promoting any of these hooks to an app-wide `hooks/` directory. The `-hooks/` folder is scoped to this route for now, just as the steps settings folder scopes its hooks.
- Adding tests — this is a structural refactor only.
- Changing the tRPC router or API contracts (`journey.active`, `stepDefinition.active`, `snap.byDate`, `snap.upsert`).
- Changing any visual behavior, copy, or styling.
- Fixing the `~/components/simple-empth` filename typo (it's used unchanged by this refactor and would be a separate, broader rename touching every importer).
- Replacing the `useQuery`-plus-lazy-init pattern with something fundamentally different (e.g., suspense + key-based remount, or `useSuspenseQuery` for the existing snap). The lazy-init pattern is preserved, just relocated into a hook.

## Further Notes

The actual end state of the steps settings refactor extracted the page component into `-steps-page.tsx` rather than leaving it in `index.tsx` as the original plan stated. This plan adopts that observed final pattern from day one — `index.tsx` is a route-only shell from Phase 2 onward.

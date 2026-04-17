# Refactor: Steps Settings Page

## Problem Statement

The steps settings page (`routes/_authenticated/settings/steps.tsx`) is a single 362-line file containing three components (`StepsSettingsPage`, `AddStepDialog`, `EditStepDialog`), all mutation logic, and all query logic. The Add and Edit dialogs duplicate nearly identical form markup (name input, type radio buttons, dialog chrome). Data-fetching concerns are tangled into UI components, making them harder to read, reuse, and maintain independently.

## Solution

Restructure the file into a TanStack Router-idiomatic `steps/` directory using the `-` prefix convention for colocated non-route files. Extract components one-per-file into `-components/`, extract data hooks one-per-file into `-hooks/`, and unify the two dialog components into a single mode-driven `StepFormDialog`.

## Commits

### Phase 1: Restructure into `steps/` directory

**Commit 1 — Convert `steps.tsx` to `steps/index.tsx` with no code changes**

Create the `steps/` directory as a sibling to where `steps.tsx` currently lives. Move `steps.tsx` to `steps/index.tsx`. Create the empty `-components/` and `-hooks/` directories inside `steps/`. No imports or code change — just the file move. TanStack Router treats `steps/index.tsx` identically to `steps.tsx` for route generation, and `-` prefixed folders are excluded from the route tree. Verify the app compiles and the route still works.

### Phase 2: Extract components one-per-file

**Commit 2 — Extract `StepListItem` into `-components/step-list-item.tsx`**

Extract the inline `<div>` block that renders each step row (name, type badge, predefined label, inactive label, move up/down buttons, edit button, toggle active button) into its own `StepListItem` component. It receives the step data, index, total count, and callback props for move up, move down, edit, and toggle active. Update `steps/index.tsx` to import and use `StepListItem`. Verify compilation.

**Commit 3 — Extract `AddStepDialog` into `-components/add-step-dialog.tsx`**

Move the `AddStepDialog` function verbatim into its own file. Update `steps/index.tsx` to import it. No logic changes. Verify compilation.

**Commit 4 — Extract `EditStepDialog` into `-components/edit-step-dialog.tsx`**

Move the `EditStepDialog` function verbatim into its own file. Update `steps/index.tsx` to import it. No logic changes. Verify compilation.

### Phase 3: Unify the Add and Edit dialogs

**Commit 5 — Create `StepFormDialog` replacing both Add and Edit dialogs**

Create `-components/step-form-dialog.tsx` with a single `StepFormDialog` component that accepts a `mode: "add" | "edit"` prop plus an optional `step` prop (for edit mode, providing initial values). The component:

- Renders the shared form fields: name `Input`, type radio buttons (numeric/text).
- In "add" mode: title is "Add Custom Step", submit label is "Add Step" / "Adding...", success toast is "Step added!", resets form on success, manages its own open state with a `DialogTrigger`.
- In "edit" mode: title is "Edit Step", submit label is "Save" / "Saving...", success toast is "Step updated!", resets name/type to the step prop values when the dialog opens.
- Each mode calls its respective mutation (create vs. update).

Delete `-components/add-step-dialog.tsx` and `-components/edit-step-dialog.tsx`. Update `steps/index.tsx` and `step-list-item.tsx` to use `StepFormDialog`. Verify compilation and that both add and edit flows still work.

### Phase 4: Extract data hooks

**Commit 6 — Extract `useStepDefinitions` hook into `-hooks/use-step-definitions.ts`**

Create the hook wrapping `useSuspenseQuery(trpc.stepDefinition.list.queryOptions())`. Update `steps/index.tsx` to use the hook instead of inline query code. Verify compilation.

**Commit 7 — Extract `useToggleStep` hook into `-hooks/use-toggle-step.ts`**

Create the hook wrapping the `toggleActive` mutation with its `onSuccess` (invalidate `stepDefinition` queries) and `onError` (toast error). Update `steps/index.tsx` to use it. Verify compilation.

**Commit 8 — Extract `useReorderSteps` hook into `-hooks/use-reorder-steps.ts`**

Create the hook wrapping the `reorder` mutation with its `onSuccess` and `onError` handlers. The `swapAndReorder` helper logic stays in the page component (it depends on the current steps list), but the raw mutation is in the hook. Update `steps/index.tsx` to use it. Verify compilation.

**Commit 9 — Extract `useCreateStep` hook into `-hooks/use-create-step.ts`**

Create the hook wrapping the `create` mutation with invalidation and toast. Accept an `onSuccess` callback parameter so the dialog can reset form state and close. Update `StepFormDialog` to use it. Verify compilation.

**Commit 10 — Extract `useUpdateStep` hook into `-hooks/use-update-step.ts`**

Create the hook wrapping the `update` mutation with invalidation and toast. Accept an `onSuccess` callback parameter so the dialog can close. Update `StepFormDialog` to use it. Verify compilation.

### Phase 5: Clean up the page component

**Commit 11 — Final cleanup of `steps/index.tsx`**

With all components and hooks extracted, the page component should be a thin shell: route definition, loader, and a composition of `StepListItem` and `StepFormDialog` with the `swapAndReorder` / `handleMoveUp` / `handleMoveDown` logic. Review for any leftover unused imports. Verify compilation and full manual test of all flows (add, edit, reorder, toggle active).

## Decision Document

- **Directory structure**: Using TanStack Router's `-` prefix convention. Route file becomes `steps/index.tsx`. Supporting files go in `steps/-components/` and `steps/-hooks/`. This is the idiomatic colocation pattern — the `-` prefix excludes these folders from route generation while keeping them importable.
- **Component granularity**: One component per file (`step-list-item.tsx`, `step-form-dialog.tsx`).
- **Hook granularity**: One hook per mutation/query (`use-step-definitions.ts`, `use-toggle-step.ts`, `use-reorder-steps.ts`, `use-create-step.ts`, `use-update-step.ts`).
- **Unified dialog**: A single `StepFormDialog` with `mode: "add" | "edit"` replaces both `AddStepDialog` and `EditStepDialog`. The trigger button is part of the component (Add mode renders its own "Add Step" trigger; Edit mode renders its own "Edit" trigger).
- **Hook callback pattern**: Mutation hooks that need caller-specific side effects (like closing a dialog or resetting form state) accept an `onSuccess` callback parameter, keeping the hook reusable while letting the caller control UI-specific behavior.
- **`swapAndReorder` stays in the page**: This helper depends on the current step list state, so it remains in the page component rather than moving into the reorder hook. The hook only wraps the raw mutation.
- **No barrel exports**: Each file is imported directly by path. No `index.ts` re-export files in `-components/` or `-hooks/`.

## Testing Decisions

- **No new tests**: There are no frontend tests in the app currently. This refactor is purely structural (no behavior changes), so we rely on TypeScript compilation and manual verification.
- **Manual verification checklist**:
  - App compiles without errors after each commit
  - Steps settings page loads and displays step definitions
  - "Add Step" dialog opens, creates a step, closes, and list updates
  - "Edit" dialog opens with pre-populated values, saves changes, closes, and list updates
  - Reorder (move up/down) works correctly
  - Toggle active/inactive works correctly
  - Predefined steps show "predefined" label and no Edit button
  - Inactive steps show "inactive" label and reduced opacity

## Out of Scope

- Refactoring other pages that use `stepDefinition` queries (e.g., `snap/new.tsx`, `progress.tsx`, `teams/`). Those pages have their own concerns and can be addressed separately.
- Extracting shared hooks to a higher level (e.g., app-wide `hooks/` directory). The `-hooks/` folder is scoped to the steps settings page for now.
- Adding tests — this is a structural refactor only.
- Changing the tRPC router or API contracts.
- Changing any visual behavior or styling.
- The repeated mutation boilerplate (invalidate + toast) — this naturally becomes cleaner once each mutation lives in its own hook. No additional abstraction layer is introduced.

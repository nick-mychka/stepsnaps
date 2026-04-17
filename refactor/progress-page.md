# Refactor: Progress Page

## Problem Statement

The progress page (`routes/_authenticated/progress/index.tsx`) is a single 875-line file containing 8 components, inline type definitions, chart constants, heavy `useMemo` data-transformation logic, and all mutation logic for editing and deleting snaps. Everything is tangled together, making it hard to navigate, maintain, or extend individual pieces (e.g., adding new chart types or improving the edit flow) without touching the entire file.

## Solution

Restructure the file following the same TanStack Router-idiomatic pattern used for the steps settings page. The route file (`index.tsx`) becomes a thin shell. The page component moves to `-progress-page.tsx`. UI components go into `-components/` (one per file), data hooks go into `-hooks/` (one per query/mutation), and types go into a colocated `-types.ts` file. All behavior is preserved exactly.

## Commits

### Phase 1: Extract shared types

**Commit 1 — Extract `SnapWithValues` type into `-types.ts`**

Create `progress/-types.ts` containing the `SnapWithValues` interface (currently defined inline around line 136). Update `index.tsx` to import from `./-types`. Verify compilation.

### Phase 2: Extract data hooks

**Commit 2 — Extract `useActiveJourney` hook into `-hooks/use-active-journey.ts`**

Create the hook wrapping `useSuspenseQuery(trpc.journey.active.queryOptions())`. Update the page component to use it. Verify compilation.

**Commit 3 — Extract `useSnaps` hook into `-hooks/use-snaps.ts`**

Create the hook wrapping `useSuspenseQuery(trpc.snap.list.queryOptions({ journeyId }))`. Both `TimelineView` and `ChartView` use this query — both will import the same hook. Verify compilation.

**Commit 4 — Extract `useUpsertSnap` hook into `-hooks/use-upsert-snap.ts`**

Create the hook wrapping the `snap.upsert` mutation with its `onSuccess` (invalidate snap queries, toast, close dialog) and `onError` (toast error). Accept an `onSuccess` callback parameter so the dialog can control its own close behavior. Update `EditSnapDialog` to use it. Verify compilation.

**Commit 5 — Extract `useDeleteSnap` hook into `-hooks/use-delete-snap.ts`**

Create the hook wrapping the `snap.delete` mutation with its `onSuccess` (invalidate snap queries, toast, close dialog) and `onError` (toast error). Accept an `onSuccess` callback parameter. Update `DeleteSnapDialog` to use it. Verify compilation.

### Phase 3: Extract timeline components

**Commit 6 — Extract `SnapCard` into `-components/snap-card.tsx`**

Move the `SnapCard` component verbatim into its own file. It imports `SnapWithValues` from `../-types`. Update the parent to import it. Verify compilation.

**Commit 7 — Extract `EditSnapDialog` into `-components/edit-snap-dialog.tsx`**

Move the `EditSnapDialog` component into its own file. It imports `SnapWithValues` from `../-types` and `useUpsertSnap` from `../-hooks/use-upsert-snap`. Update the parent to import it. Verify compilation.

**Commit 8 — Extract `DeleteSnapDialog` into `-components/delete-snap-dialog.tsx`**

Move the `DeleteSnapDialog` component into its own file. It imports `useDeleteSnap` from `../-hooks/use-delete-snap`. Update the parent to import it. Verify compilation.

**Commit 9 — Extract `TimelineView` into `-components/timeline-view.tsx`**

Move the `TimelineView` component into its own file. It imports `SnapCard`, `EditSnapDialog`, `DeleteSnapDialog`, and the `useSnaps` hook. Update the page component to import it. Verify compilation.

### Phase 4: Extract chart components

**Commit 10 — Extract `FunnelTooltip` into `-components/funnel-tooltip.tsx`**

Move the `FunnelTooltip` component and its `FunnelTooltipProps` / `FunnelTooltipPayloadItem` interfaces into their own file. Verify compilation.

**Commit 11 — Extract `ApplicationTrendChart` into `-components/application-trend-chart.tsx`**

Move the `ApplicationTrendChart` component into its own file. Move the `FUNNEL_LABELS`, `FUNNEL_COLORS` constants into this same file (they are only used here). It imports `FunnelTooltip` from `./funnel-tooltip`. Verify compilation.

**Commit 12 — Extract `ChartView` into `-components/chart-view.tsx`**

Move the `ChartView` component into its own file. Move the `CHART_COLORS` constant into this same file (it is only used here). The heavy `useMemo` chart-data-transformation logic stays inside `ChartView` — it is tightly coupled to the chart rendering. It imports `ApplicationTrendChart` and the `useSnaps` hook. Verify compilation.

### Phase 5: Thin out the page component

**Commit 13 — Move page component to `-progress-page.tsx`, thin out `index.tsx`**

Create `-progress-page.tsx` containing the `ProgressPage` component. It imports `useActiveJourney`, `TimelineView`, and `ChartView`. The route `index.tsx` becomes a thin shell: route definition, loader (prefetch active journey), and component import — matching the steps settings pattern. Review for unused imports. Verify compilation and full manual test of all flows.

## Decision Document

- **Directory structure**: Same pattern as the steps settings refactor — TanStack Router `-` prefix convention. Route file is `progress/index.tsx`. Supporting files go in `progress/-components/`, `progress/-hooks/`, and `progress/-types.ts`.
- **Component granularity**: One component per file (`snap-card.tsx`, `edit-snap-dialog.tsx`, `delete-snap-dialog.tsx`, `timeline-view.tsx`, `funnel-tooltip.tsx`, `application-trend-chart.tsx`, `chart-view.tsx`).
- **Hook granularity**: One hook per query/mutation (`use-active-journey.ts`, `use-snaps.ts`, `use-upsert-snap.ts`, `use-delete-snap.ts`).
- **Types colocated**: `SnapWithValues` lives in `progress/-types.ts`. It is imported by components that need it (`snap-card.tsx`, `edit-snap-dialog.tsx`, `timeline-view.tsx`).
- **Chart constants stay with their components**: `CHART_COLORS` moves into `chart-view.tsx`, `FUNNEL_LABELS` and `FUNNEL_COLORS` move into `application-trend-chart.tsx`. These are hardcoded for now and will change when chart features are reworked.
- **Chart data transformation stays in `ChartView`**: The `useMemo` block that builds chart data is tightly coupled to the chart rendering. Extracting it into a hook would create artificial separation without real benefit. It stays inline.
- **Hook callback pattern**: Mutation hooks accept an `onSuccess` callback parameter for caller-specific side effects (closing dialogs), same pattern as the steps settings refactor.
- **No barrel exports**: Each file is imported directly by path. No `index.ts` re-export files in `-components/` or `-hooks/`.
- **Extraction order**: Types first, then hooks, then leaf components (cards, dialogs), then container components (views), then page component. This order means each commit only adds imports to files that already exist, minimizing churn.

## Testing Decisions

- **No new tests**: There are no frontend tests in the app currently. This refactor is purely structural (no behavior changes), so we rely on TypeScript compilation and manual verification.
- **Manual verification checklist**:
  - App compiles without errors after each commit
  - Progress page loads with an active journey and displays the timeline view
  - Progress page shows "No Active Journey" card when there is no journey
  - Timeline/Chart view toggle works
  - Timeline view shows snap cards in reverse chronological order
  - Snap card displays numeric values and text value tooltips correctly
  - Edit snap dialog opens with pre-populated values, saves changes, and list updates
  - Delete snap dialog confirms and removes the snap
  - Bar chart renders daily activity with correct data
  - Application trend line chart renders (when funnel steps exist)
  - Empty states show correctly (no snaps, no chart data)

## Out of Scope

- Refactoring the chart data transformation logic or the funnel hardcoding — this will be addressed in a future feature pass on charts.
- Extracting shared hooks to a higher level (e.g., app-wide `hooks/` directory). Hooks are scoped to the progress page.
- Adding tests — this is a structural refactor only.
- Changing the tRPC router or API contracts.
- Changing any visual behavior, styling, or chart rendering.
- Refactoring the `snap/new.tsx` page (the other consumer of `trpc.snap.*`).
- Performance optimizations (e.g., lazy loading chart components).

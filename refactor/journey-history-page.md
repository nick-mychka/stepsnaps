# Refactor: Journey History Page

## Problem Statement

The journey history route (`journey/history.tsx`) is a single 203-line file containing the route definition, page component, card component, edit dialog, mutation logic, and a hand-written interface. This doesn't match the established pattern from the steps settings refactor, where the route file is thin and delegates to a page component backed by co-located `-components/` and `-hooks/` directories.

## Solution

Apply the same decomposition pattern used in the steps settings page:

- Thin route file (`history.tsx`) — only `createFileRoute`, loader, and component import
- Page component (`-journey-history-page.tsx`) — layout, state ownership (including dialog open/selected journey), data fetching via hook
- Co-located `-components/` — `JourneyCard` and `EditDetailsDialog` as separate files
- Co-located `-hooks/` — `useJourneys` and `useUpdateJourneyDetails`

Dialog state moves from `JourneyCard` up to the page component, matching how the steps page owns `StepFormDialog` state.

## Commits

1. **Extract `useJourneys` hook into `-hooks/use-journeys.ts`**
   - Create `journey/-hooks/use-journeys.ts`
   - Move the `useTRPC` + `useSuspenseQuery(trpc.journey.list.queryOptions())` call into a `useJourneys` hook that returns the query result
   - Import and use the new hook in `history.tsx` in place of the inline query
   - Verify the app still works

2. **Extract `useUpdateJourneyDetails` hook into `-hooks/use-update-journey-details.ts`**
   - Create `journey/-hooks/use-update-journey-details.ts`
   - Move the `useMutation(trpc.journey.updateDetails.mutationOptions(...))` logic into a `useUpdateJourneyDetails` hook
   - The hook should accept an `onSuccess` callback (for closing the dialog) and handle `queryClient.invalidateQueries` and toast internally
   - Import and use the new hook in `history.tsx` in place of the inline mutation
   - Verify the app still works

3. **Extract `JourneyCard` component into `-components/journey-card.tsx`**
   - Create `journey/-components/journey-card.tsx`
   - Move the `JourneyCard` function and the `JourneyData` interface into it
   - Remove dialog state (`editOpen`) from the card — instead accept `onEdit` callback prop from the parent
   - The card no longer renders `EditDetailsDialog`; it just calls `onEdit` when the button is clicked
   - Import and use in `history.tsx`
   - Verify the app still works

4. **Extract `EditDetailsDialog` component into `-components/edit-details-dialog.tsx`**
   - Create `journey/-components/edit-details-dialog.tsx`
   - Move the `EditDetailsDialog` function into it
   - It receives `open`, `onOpenChange`, and `journey` as props (same as before)
   - It uses the `useUpdateJourneyDetails` hook internally
   - Import and use in `history.tsx`
   - Verify the app still works

5. **Lift dialog state to page and extract page component into `-journey-history-page.tsx`**
   - Create `journey/-journey-history-page.tsx`
   - Move the page component out of `history.tsx` into the new file as `JourneyHistoryPage`
   - The page component owns `editOpen` and `selectedJourney` state
   - It renders the journey list with `JourneyCard` (passing `onEdit` to set the selected journey and open the dialog)
   - It renders a single `EditDetailsDialog` at the page level (not per-card)
   - Slim `history.tsx` down to just the route definition, loader, and component import
   - Verify the app still works

6. **Finalize refactor**
   - Review the final file structure matches the steps pattern
   - Clean up any unused imports across all touched files
   - Verify the app still works end to end

## Decision Document

- Follow the exact same co-location pattern as the steps settings page: thin route file, page component in a prefixed file, `-components/` and `-hooks/` directories
- Dialog state (open/close and selected journey) is owned by the page component, not by individual cards — this matches the steps pattern and avoids rendering one dialog per card
- The `JourneyData` interface stays hand-written and lives alongside the component that defines it (`journey-card.tsx`) — cleaning it up to use tRPC inference is out of scope
- The `useUpdateJourneyDetails` hook encapsulates cache invalidation and toast notifications, accepting only a callback for side effects the caller cares about (closing the dialog)
- The `EditDetailsDialog` uses `useUpdateJourneyDetails` internally rather than receiving the mutation as a prop

## Testing Decisions

- No tests exist for this area currently
- Testing is out of scope for this refactor
- The refactor is purely structural (moving code between files, lifting state) with no behavior changes, so manual verification after each commit is sufficient

## Out of Scope

- Replacing the hand-written `JourneyData` interface with tRPC-inferred types
- Adding tests
- Any behavior changes or new features
- Modifying the tRPC router or backend

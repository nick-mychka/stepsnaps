# PRD: StepSnaps V3 — Snap Goals

## Problem Statement

Users can log daily numeric values for their steps (interviews, code commits, study minutes, etc.), but they have no way to set daily targets or see at a glance how close they are to their goal. Without a goal reference, the raw numbers lack context — "2 interviews" means nothing until you know you were aiming for 3. Users want to set goals for numeric steps and see a visual progress indicator while logging their daily snap.

## Solution

Add an optional **goal value** to each numeric step definition. When a user logs a snap, each numeric step with a goal displays a **progress bar** (shadcn Progress component) below the input field, filling proportionally toward the goal. The actual value and goal are shown as "X of Y" to the right of the bar. When a snap is created, the current goal is **snapshotted** onto the snap value so that historical snaps always show progress against the goal that was active at the time of creation.

## User Stories

1. As a user, I want to set a daily goal for a numeric step, so that I have a clear target to work toward each day.
2. As a user, I want goals to be optional, so that I'm not forced to set targets for every metric.
3. As a user creating a custom numeric step, I want to optionally set a goal value, so that new steps can have targets from the start.
4. As a user, I want to edit the goal for any numeric step in settings, so that I can adjust my targets over time.
5. As a user, I want predefined numeric steps to start with a default goal of 10, so that I have reasonable starting targets out of the box.
6. As a user, I want to remove a goal from a step (set it to empty), so that the progress bar disappears if I no longer want a target.
7. As a user logging a snap, I want to see a progress bar below each numeric input that has a goal, so that I can visually gauge how close I am to my target.
8. As a user, I want the progress bar to fill proportionally (e.g., 2 of 3 = ~67% filled), so that I can quickly see my progress.
9. As a user, I want to see "X of Y" displayed to the right of the progress bar, so that I know both my actual value and target.
10. As a user who logged 0, I want the progress bar to show as empty, so that I can see I haven't started.
11. As a user who exceeded the goal, I want the progress bar to show as fully filled (capped at 100%), so that the visual stays clean.
12. As a user, I want numeric steps without a goal to show just the number input with no progress bar, so the form stays uncluttered.
13. As a user, I want text steps to have no goal or progress bar, so that goals only apply to numeric metrics.
14. As a user, I want the goal to be snapshotted when I create a snap, so that if I change the goal later, my old snaps still reflect the goal I was working toward at the time.
15. As a user re-editing an existing snap, I want it to keep the goal that was snapshotted when the snap was first created, so that historical records stay consistent.
16. As a user editing a past snap from the timeline, I want to see the progress bar against that snap's original snapshotted goal, so that past entries are displayed in their original context.

## Implementation Decisions

### Data Model Changes

**StepDefinition table** — add one column:
- `goalValue` (numeric, nullable, precision 10 scale 2). Null means "no goal." Default for predefined numeric steps: 10.

**SnapValue table** — add one column:
- `goalValue` (numeric, nullable, precision 10 scale 2). Snapshot of the step definition's goal at the time the snap was first created. Null means the step had no goal when this snap was created.

### Goal Snapshotting Logic

- When a snap is **created** (first upsert for a given date), each snap value copies `goalValue` from its step definition.
- When a snap is **re-saved** (upsert for an existing snap date), the snap values retain their original `goalValue`. The upsert mutation must read existing snap values and carry forward their goal rather than re-copying from the step definition.
- This means the snap upsert logic changes: instead of delete-all-then-insert, it needs to preserve goal values from existing snap values when re-saving.

### Step Settings Changes

- The step form dialog (create and edit) adds a **Goal** input field for numeric steps only.
- The goal field is a numeric input, optional (can be left empty for no goal).
- The field is hidden when the step type is "text."
- Predefined steps can also have their goal edited (even though name/type are locked for predefined steps).

### Step Definition Router Changes

- `create` mutation accepts optional `goalValue` (number, nullable).
- `update` mutation accepts optional `goalValue` (number, nullable). This allows editing goals for both custom and predefined steps.

### Snap Form Changes

- Below each numeric input that has a goal (either from step definition for new snaps, or snapshotted on existing snap values), render:
  - A shadcn `Progress` component with `value` = `min((numericValue / goalValue) * 100, 100)`
  - A label to the right: "{numericValue} of {goalValue}"
- When `numericValue` is empty or 0, progress is 0%.
- When `numericValue >= goalValue`, progress is capped at 100%.
- Numeric steps with no goal: no progress bar, just the input.
- Text steps: unchanged (no progress bar).

### Predefined Steps Seeding

- Update the seeding logic to include `goalValue: 10` for all predefined numeric steps.
- The text step ("New Knowledge") gets no goal (null).

### UI Component

- Add the shadcn `Progress` component to the UI package (`packages/ui`). This component does not currently exist in the project.

### Key Constraints

- Goals only apply to numeric steps. Text steps are excluded entirely.
- Goals are optional — null means "no goal."
- The progress visualization is limited to the snap form (`/snap/new`) for now. Progress page charts and dashboard widgets are future scope.
- Progress bar caps at 100% — no overflow/wrap behavior.

## Testing Decisions

A good test verifies external behavior through the public interface — given an input, assert the expected output or side effect. Tests should not depend on internal implementation details.

### Modules to test

- **Goal snapshotting on snap upsert**: Creating a snap copies goal from step definition. Re-saving the same snap preserves the original goal. Changing the step definition goal and creating a new snap uses the new goal.
- **Step definition CRUD with goals**: Creating/updating steps with goal values. Setting goal to null. Verifying goal is returned in queries.

### Test approach

- Integration tests against real database via tRPC router calls, consistent with existing test patterns.
- Test the snap upsert specifically: create snap, verify snapshotted goal, change step goal, re-save snap, verify original goal preserved, create snap on new date, verify new goal used.

## Out of Scope

- Progress bars or goal reference lines on the progress page charts (future).
- Dashboard widget showing today's progress rings/bars (future).
- Goal history tracking or changelog (the snapshot on snap values provides implicit history).
- Goals for text steps.
- Team-level goals or shared goals.
- Goal streaks or notifications when goals are met.
- Per-day or per-week varying goals (goals are a single value on the step definition).

## Further Notes

- The snapshotting approach means the snap upsert mutation can no longer simply delete-all-then-insert snap values. It must check for existing values and carry forward their `goalValue`. This is the most significant implementation change.
- When editing a past snap from the timeline, the form should load the snapshotted goal from the existing snap values, not the current step definition goal. This ensures the progress bar reflects the historical context.
- The shadcn Progress component needs to be added to the project via the shadcn CLI or manually.
- Default goal of 10 is a starting point — the user confirmed this is intentional with the ability to edit.

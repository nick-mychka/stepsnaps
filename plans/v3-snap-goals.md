# Plan: Snap Goals (V3)

> Source PRD: `prd/v3-snap-goals.md`

## Architectural decisions

- **Routes**: No new routes. Modify existing `/snap/new` (snap form) and `/settings/steps` (step settings dialog).
- **Schema**: Add `goalValue` (numeric, precision 10 scale 2, nullable) to both `StepDefinition` and `SnapValue` tables. Nullable = no goal.
- **Key models**: `StepDefinition.goalValue` is the current/editable goal. `SnapValue.goalValue` is the frozen snapshot at snap creation time.
- **Snapshotting rule**: First upsert for a date copies goal from StepDefinition. Re-saves for the same date preserve the original snapshotted goal.
- **UI component**: shadcn `Progress` component (needs to be added to `packages/ui`).
- **Predefined steps default**: All numeric predefined steps seed with `goalValue: 10`. Text step gets `null`.

---

## Phase 1: Set a Goal

**User stories**: 1, 2, 3, 4, 5, 6, 13

### What to build

End-to-end ability to set, edit, and remove goal values on numeric step definitions. Add a `goalValue` column to the `StepDefinition` table. Update the stepDefinition tRPC router so `create` and `update` mutations accept an optional `goalValue`. In the step settings UI, add a numeric "Goal" input to the step form dialog — visible only when the step type is "numeric", hidden for text. Allow predefined steps to have their goal edited (even though name/type are locked). Update the predefined steps seeding logic to include `goalValue: 10` for all numeric steps and `null` for the text step.

### Acceptance criteria

- [ ] `StepDefinition` table has a nullable `goalValue` numeric column
- [ ] Database migration runs cleanly (existing steps get `null` goalValue)
- [ ] `stepDefinition.create` accepts optional `goalValue` and persists it
- [ ] `stepDefinition.update` accepts optional `goalValue` and persists it (works for both custom and predefined steps)
- [ ] `stepDefinition.active` and `stepDefinition.list` queries return `goalValue`
- [ ] Step form dialog shows a "Daily goal" numeric input when type is "numeric"
- [ ] Step form dialog hides the goal input when type is "text"
- [ ] User can create a custom numeric step with a goal
- [ ] User can edit the goal on any existing numeric step (including predefined)
- [ ] User can clear the goal (set to empty/null)
- [ ] New users get predefined numeric steps with `goalValue: 10`
- [ ] Existing users' steps are unaffected (goalValue stays null until they set one)

---

## Phase 2: See Your Progress

**User stories**: 7, 8, 9, 10, 11, 12, 14, 15, 16

### What to build

End-to-end progress visualization on the snap form. Add a `goalValue` column to the `SnapValue` table. Change the snap upsert mutation: on first creation for a date, copy each step's current `goalValue` from `StepDefinition` into the corresponding `SnapValue`; on re-save of an existing snap, carry forward the original snapshotted `goalValue` from the previous snap values instead of re-copying from the definition. Add the shadcn `Progress` component to the UI package. On the snap form, render a progress bar below each numeric input that has a snapshotted goal — filling proportionally with a cap at 100%, and showing "X of Y" to the right. When editing a past snap from the timeline, load the snapshotted goal from the existing snap values.

### Acceptance criteria

- [ ] `SnapValue` table has a nullable `goalValue` numeric column
- [ ] Creating a new snap snapshots the current `StepDefinition.goalValue` into each `SnapValue.goalValue`
- [ ] Re-saving an existing snap preserves the originally snapshotted `goalValue` (does not overwrite with current step definition goal)
- [ ] Changing a step's goal and creating a snap on a new date uses the new goal
- [ ] `snap.byDate` returns `goalValue` on each snap value
- [ ] shadcn `Progress` component is available in `packages/ui`
- [ ] Snap form shows a progress bar below each numeric input where `goalValue` is present
- [ ] Progress bar fills proportionally: `value / goalValue * 100`, capped at 100%
- [ ] "X of Y" label displays to the right of the progress bar
- [ ] Empty/zero numeric value shows 0% progress bar
- [ ] Value exceeding goal shows 100% filled bar
- [ ] Numeric steps with no goal (null) show just the input, no progress bar
- [ ] Text steps show no progress bar
- [ ] Editing a past snap shows progress bars against the snapshotted goal from that snap

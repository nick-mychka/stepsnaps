---
name: StepSnaps V3 — Snap Goals
description: V3 adds optional goal values to numeric steps with progress bars on snap form and goal snapshotting
type: project
---

V3 adds optional daily goals to numeric step definitions with visual progress tracking on the snap form.

**Key decisions:**
- `goalValue` column (numeric, nullable, precision 10 scale 2) added to both StepDefinition and SnapValue tables
- Goals are optional (null = no goal), only for numeric steps — text steps excluded
- Predefined numeric steps seed with goalValue: 10; text step gets null
- Goal snapshotting: first snap creation copies goal from StepDefinition; re-saves preserve original snapshotted goal
- Snap upsert changes from delete-all-then-insert to preserving existing goalValues on re-save
- Progress bar (shadcn Progress component, needs adding to packages/ui) below each numeric input with goal
- Progress capped at 100%, shown as "X of Y" label
- Editing past snaps shows progress against the snapshotted goal, not current step definition goal
- Two phases: Phase 1 = set/edit/remove goals on steps; Phase 2 = progress visualization on snap form

**Why:** Raw numbers lack context without targets. Goals give users daily motivation and visual feedback.

**How to apply:** Reference `prd/v3-snap-goals.md` and `plans/v3-snap-goals.md` for full details. This is the current active development scope.

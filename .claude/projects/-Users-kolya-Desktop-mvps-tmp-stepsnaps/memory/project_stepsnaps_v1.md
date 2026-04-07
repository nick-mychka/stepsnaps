---
name: StepSnaps V1 scope and decisions
description: Key product decisions for StepSnaps V1 — hiring journey tracker with daily snaps, charts, teams
type: project
---

StepSnaps V1 is a web-only (TanStack Start) app for tracking daily hiring journey activities.

**Key decisions:**
- One active journey at a time per user; can start new ones after finishing
- One snap per calendar day, editable unlimited times, any past snap editable from timeline
- Predefined steps seeded on first journey creation (not signup)
- Step config changes are forward-only (don't affect past snaps)
- Custom steps support numeric and text types only
- Text steps visualized as 0/1 on charts with tooltip for actual content
- Bar chart: X=days, Y=step values, one series per step
- Teams: admin (creator) can view but not edit teammate data; members can be in multiple teams
- Invite via link only, no email notifications
- Google OAuth only for V1
- Expo mobile app is out of scope for V1

**Why:** First release focused on core tracking + accountability loop. Keep scope tight.

**How to apply:** Reference `prd/v1-daily-hiring-journey-tracker.md` for full details. Scope decisions should stay within these boundaries.

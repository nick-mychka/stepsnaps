# PRD: StepSnaps V1 — Daily Hiring Journey Tracker

## Problem Statement

Job seekers lack a structured way to track their daily hiring-related activities over time. During a job search, candidates perform many small actions daily — sending applications, doing interviews, coding, studying — but have no simple tool to log these efforts, visualize progress, or share accountability with peers. Without visibility into their own consistency, candidates lose motivation and can't identify patterns in what's working.

## Solution

StepSnaps is a web application that lets users track daily "steps" (metrics) during their hiring journey. Users start a journey, then create a daily "snap" — a snapshot of what they accomplished that day across configurable categories. They can view their progress over time via bar charts and a timeline history. Users can also form teams to share visibility into each other's progress for accountability.

## User Stories

### Authentication

1. As a new user, I want to sign up with my Google account, so that I can quickly start using the app without creating a new password.
2. As a returning user, I want to sign in with my Google account, so that I can access my existing data.
3. As a signed-in user, I want to sign out, so that I can secure my account on shared devices.

### Journey Lifecycle

4. As a user, I want to start a new journey, so that I can begin tracking my hiring progress from a specific start date.
5. As a user, I want to have only one active journey at a time, so that my tracking stays focused on my current job search.
6. As a user, I want to finish my journey when I receive an offer, so that I can mark this phase of my job search as complete.
7. As a user finishing a journey, I want to optionally enter the company name and offer details in a dialog, so that I can record the outcome.
8. As a user who skipped entering offer details, I want to add or edit those details later, so that I'm not forced to fill them in immediately.
9. As a user, I want to view a list of my past journeys, so that I can review my hiring history.
10. As a user with a completed journey, I want to start a new journey, so that I can track a future job search separately.

### Daily Snaps

11. As a user with an active journey, I want to create a daily snap, so that I can record what I accomplished today.
12. As a user, I want only one snap per calendar day, so that my tracking remains organized by day.
13. As a user, I want to edit my snap for today as many times as I want, so that I can update values throughout the day.
14. As a user, I want snaps for days I missed to show as empty/zero, so that I have an honest record of my activity.
15. As a user creating a snap, I want to see a list of steps to fill in, so that I know what to track.

### Predefined Steps

16. As a new user, I want a predefined set of steps available by default, so that I can start tracking immediately without configuration.
17. As a user, I want to track the number of interviews I had today (numeric input), so that I can measure my interview activity.
18. As a user, I want to track the number of HR responses I received (numeric input), so that I can gauge recruiter engagement.
19. As a user, I want to track the number of vacancy responses I received (numeric input), so that I can measure application success rate.
20. As a user, I want to track the number of code commits I made (numeric input), so that I can measure my coding output.
21. As a user, I want to track my coding time in hours (numeric input), so that I can monitor time spent on technical preparation.
22. As a user, I want to track my English study time in minutes (numeric input), so that I can monitor language practice.
23. As a user, I want to record new knowledge gained — tooling, features, etc. (textarea), so that I can journal what I learned.

### Steps Configuration

24. As a user, I want to access a steps configuration screen, so that I can customize what I track daily.
25. As a user, I want to delete predefined steps I don't need, so that my snap form only shows relevant metrics.
26. As a user, I want to add custom steps with a name and type (numeric or text), so that I can track metrics specific to my situation.
27. As a user, I want to edit my custom steps (name, type), so that I can refine my tracking over time.
28. As a user, I want to delete custom steps I no longer need, so that my snap form stays clean.
29. As a user, I want my step configuration changes to only affect future snaps, so that my historical data remains intact.

### Progress — Chart View

30. As a user, I want to view a bar chart of my progress, so that I can visualize my daily activity over time.
31. As a user, I want the chart X-axis to show days (from journey start to today or journey end), so that I can see my timeline.
32. As a user, I want the chart Y-axis to show step values, so that I can see the magnitude of my daily effort.
33. As a user, I want each step displayed as a separate category/series in the chart, so that I can compare different metrics.
34. As a user, I want text/string steps to show as 1 (present) or 0 (absent) on the chart, so that string data is still visualized.
35. As a user, I want to see the actual text content in a tooltip when hovering over a string step's bar, so that I can read what I wrote.

### Progress — Timeline View

36. As a user, I want to view my progress as a vertical timeline, so that I can scroll through my daily history.
37. As a user, I want each day's snap displayed as a card in the timeline, so that I can see all step values for that day at a glance.
38. As a user, I want to edit a snap from the timeline, so that I can correct past entries.
39. As a user, I want to delete a snap from the timeline, so that I can remove erroneous records.

### Teams

40. As a user, I want to create a team, so that I can track hiring progress with peers.
41. As a team creator, I want to be the admin of my team, so that I have management capabilities.
42. As a team admin, I want to add team members by generating an invite link, so that I can grow my team.
43. As a team admin, I want to view each teammate's individual progress (chart and timeline views), so that I can support their job search.
44. As a team member, I want to be part of multiple teams, so that I can participate in different accountability groups.
45. As a team admin, I want to resend an invitation link to a user, so that they can join later if they initially declined.

### Invite Flow

46. As an invited user who is not yet registered, I want to sign up via the invite link, so that I can join the app and the team in one flow.
47. As a newly signed-up user from an invite, I want to choose to join the invited team, so that I can start collaborating immediately.
48. As a newly signed-up user from an invite, I want to choose to create my own team instead, so that I have the option to lead my own group.
49. As a newly signed-up user from an invite, I want to choose private tracking (no team), so that I can use the app solo.
50. As a user who chose private tracking, I want to be able to join a team later via a new invite, so that I'm not permanently locked out of teams.

## Implementation Decisions

### Data Model

**Journeys table**: Belongs to a user. Stores start date, end date (nullable), status (active/completed), company name (nullable), offer details (nullable). A user can have many journeys but at most one with status=active.

**Step Definitions table**: Belongs to a user. Stores step name, type (numeric/text), is_predefined (boolean), sort order, is_active (boolean — soft delete to preserve history). When a user first starts, seed their step definitions from a predefined list.

**Snaps table**: Belongs to a journey. Stores the date (unique per journey + date). One snap per day.

**Snap Values table**: Belongs to a snap. References a step definition. Stores numeric_value (nullable) and text_value (nullable) depending on step type.

**Teams table**: Stores team name, creator (admin) user reference.

**Team Members table**: Join table between teams and users. Stores status (pending/active/declined).

**Team Invites table**: Stores invite token, team reference, created-by user, expiration. Used for link-based invitations.

### Architecture

- **API layer**: tRPC routers for journeys, snaps, steps, teams. All mutations are protected (require auth).
- **Auth**: Google OAuth only via Better Auth (already configured).
- **Database**: Drizzle ORM with PostgreSQL (already configured).
- **Frontend**: TanStack Start (SSR), using the existing shadcn/ui component library for UI.
- **Charts**: Use a charting library (e.g., Recharts) for bar chart visualization.
- **Validation**: Zod schemas in the shared `validators` package, used by both API and frontend.

### Key Constraints

- Step config changes are forward-only — past snaps retain their recorded step definitions.
- String/text step values are visualized as binary (0/1) on charts, with tooltip showing actual content.
- Team admins can only view (not edit/delete) teammate data.
- No team size limit enforced.
- Web only (TanStack Start) for V1; Expo app is out of scope.

## Testing Decisions

A good test verifies external behavior through the public interface — given an input, assert the expected output or side effect. Tests should not depend on internal implementation details (private methods, internal state shape, specific SQL queries).

### Modules to test

- **Journey lifecycle logic**: Creating/finishing journeys, enforcing one-active-at-a-time constraint, journey history queries.
- **Snap CRUD**: Creating snaps (one per day enforcement), editing, deleting, fetching by date range.
- **Step definitions**: Adding/removing/editing steps, verifying forward-only effect on snaps.
- **Team permissions**: Admin can view teammate progress, non-admin cannot. Invite token generation and redemption.

### Test approach

- Integration tests against real database (using test database with transactions rolled back after each test).
- Test via tRPC router calls (API-level tests) rather than unit-testing individual DB queries.
- Look at existing `post` router tests (if any) as prior art for test setup patterns.

## Out of Scope

- Mobile app (Expo) — deferred beyond V1.
- Email notifications for invites — V1 uses link-only invites.
- Aggregated team dashboard / team-level analytics.
- Apple OAuth — V1 is Google only.
- Step types beyond numeric and text (e.g., boolean/checkbox).
- Data export / import.
- Public profiles or sharing progress outside the app.
- Gamification (streaks, badges, etc.).

## Further Notes

- The predefined steps list should be seeded on first journey creation, not on signup, since users may sign up via invite without immediately starting a journey.
- The "join later" flow for users who declined an invite can be handled by the admin resending a new invite link — no need for a separate "browse and join teams" feature in V1.
- The snap editing window has no time restriction — users can edit any past snap from the timeline view, not just today's.
- Journey history should show basic stats summary (duration, total snaps recorded) for completed journeys.

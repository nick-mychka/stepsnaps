/**
 * One-off data migration: rename predefined step labels for clarity.
 *
 * Run with: pnpm with-env tsx src/rename-steps.ts
 */
import { and, eq } from "drizzle-orm";

import { db } from "./client";
import { StepDefinition } from "./schema";

async function main() {
  // Rename "HR Responses" → "Recruiter Replies"
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hrResult = await db
    .update(StepDefinition)
    .set({ name: "Recruiter Replies" })
    .where(
      and(
        eq(StepDefinition.name, "HR Responses"),
        eq(StepDefinition.isPredefined, true),
      ),
    );

  // Rename "Vacancy Responses" → "Applications Sent"
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const vacancyResult = await db
    .update(StepDefinition)
    .set({ name: "Applications Sent" })
    .where(
      and(
        eq(StepDefinition.name, "Vacancy Responses"),
        eq(StepDefinition.isPredefined, true),
      ),
    );

  // Fix sort order: Interviews=0, Recruiter Replies=1, Applications Sent=2
  await db
    .update(StepDefinition)
    .set({ sortOrder: 0 })
    .where(
      and(
        eq(StepDefinition.name, "Interviews"),
        eq(StepDefinition.isPredefined, true),
      ),
    );

  await db
    .update(StepDefinition)
    .set({ sortOrder: 1 })
    .where(
      and(
        eq(StepDefinition.name, "Recruiter Replies"),
        eq(StepDefinition.isPredefined, true),
      ),
    );

  await db
    .update(StepDefinition)
    .set({ sortOrder: 2 })
    .where(
      and(
        eq(StepDefinition.name, "Applications Sent"),
        eq(StepDefinition.isPredefined, true),
      ),
    );

  console.log("Done! Renamed predefined steps and updated sort order.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

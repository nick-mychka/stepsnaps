import type { TRPCRouterRecord } from "@trpc/server";

import { asc, eq } from "@stepsnaps/db";
import { StepDefinition } from "@stepsnaps/db/schema";

import { protectedProcedure } from "../trpc";

export const stepDefinitionRouter = {
  /** List all active step definitions for the current user. */
  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.StepDefinition.findMany({
      where: eq(StepDefinition.userId, ctx.session.user.id),
      orderBy: asc(StepDefinition.sortOrder),
    });
  }),

  /** List only active step definitions (for snap form). */
  active: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.StepDefinition.findMany({
      where: (sd, { and, eq }) =>
        and(eq(sd.userId, ctx.session.user.id), eq(sd.isActive, true)),
      orderBy: asc(StepDefinition.sortOrder),
    });
  }),
} satisfies TRPCRouterRecord;

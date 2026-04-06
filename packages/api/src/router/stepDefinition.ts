import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, asc, eq } from "@stepsnaps/db";
import { StepDefinition } from "@stepsnaps/db/schema";

import { protectedProcedure } from "../trpc";

export const stepDefinitionRouter = {
  /** List all step definitions for the current user (including inactive). */
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

  /** Create a custom step definition. */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(256),
        type: z.enum(["numeric", "text"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Determine next sort order
      const last = await ctx.db.query.StepDefinition.findFirst({
        where: eq(StepDefinition.userId, ctx.session.user.id),
        orderBy: (sd, { desc }) => desc(sd.sortOrder),
      });
      const sortOrder = (last?.sortOrder ?? -1) + 1;

      const [step] = await ctx.db
        .insert(StepDefinition)
        .values({
          userId: ctx.session.user.id,
          name: input.name,
          type: input.type,
          isPredefined: false,
          sortOrder,
          isActive: true,
        })
        .returning();

      return step ?? null;
    }),

  /** Update a step definition's name and/or type. */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(256).optional(),
        type: z.enum(["numeric", "text"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const step = await ctx.db.query.StepDefinition.findFirst({
        where: and(
          eq(StepDefinition.id, input.id),
          eq(StepDefinition.userId, ctx.session.user.id),
        ),
      });
      if (!step) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Step definition not found",
        });
      }

      const [updated] = await ctx.db
        .update(StepDefinition)
        .set({
          ...(input.name !== undefined && { name: input.name }),
          ...(input.type !== undefined && { type: input.type }),
        })
        .where(eq(StepDefinition.id, input.id))
        .returning();

      return updated ?? null;
    }),

  /** Toggle a step definition's active state (soft delete / restore). */
  toggleActive: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const step = await ctx.db.query.StepDefinition.findFirst({
        where: and(
          eq(StepDefinition.id, input.id),
          eq(StepDefinition.userId, ctx.session.user.id),
        ),
      });
      if (!step) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Step definition not found",
        });
      }

      const [updated] = await ctx.db
        .update(StepDefinition)
        .set({ isActive: !step.isActive })
        .where(eq(StepDefinition.id, input.id))
        .returning();

      return updated ?? null;
    }),

  /** Reorder step definitions by providing an ordered list of IDs. */
  reorder: protectedProcedure
    .input(z.object({ ids: z.array(z.string().uuid()) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        for (const [i, id] of input.ids.entries()) {
          await tx
            .update(StepDefinition)
            .set({ sortOrder: i })
            .where(
              and(
                eq(StepDefinition.id, id),
                eq(StepDefinition.userId, ctx.session.user.id),
              ),
            );
        }
      });
    }),
} satisfies TRPCRouterRecord;

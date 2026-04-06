import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, desc, eq } from "@stepsnaps/db";
import { Journey, StepDefinition } from "@stepsnaps/db/schema";

import { protectedProcedure } from "../trpc";

export const journeyRouter = {
  /** Get the user's active journey (if any). */
  active: protectedProcedure.query(async ({ ctx }) => {
    const journey = await ctx.db.query.Journey.findFirst({
      where: and(
        eq(Journey.userId, ctx.session.user.id),
        eq(Journey.status, "active"),
      ),
    });
    return journey ?? null;
  }),

  /** List all journeys for the user, most recent first. */
  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.Journey.findMany({
      where: eq(Journey.userId, ctx.session.user.id),
      orderBy: desc(Journey.createdAt),
    });
  }),

  /** Get a single journey by ID (must belong to the user). */
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const journey = await ctx.db.query.Journey.findFirst({
        where: and(
          eq(Journey.id, input.id),
          eq(Journey.userId, ctx.session.user.id),
        ),
      });
      if (!journey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Journey not found",
        });
      }
      return journey;
    }),

  /** Start a new journey. Fails if the user already has an active journey. */
  start: protectedProcedure
    .input(
      z.object({
        startDate: z.string().date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.Journey.findFirst({
        where: and(
          eq(Journey.userId, ctx.session.user.id),
          eq(Journey.status, "active"),
        ),
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already have an active journey",
        });
      }

      const [journey] = await ctx.db
        .insert(Journey)
        .values({
          userId: ctx.session.user.id,
          startDate: input.startDate,
          status: "active",
        })
        .returning();

      // Seed predefined step definitions on first journey creation
      const existingSteps = await ctx.db.query.StepDefinition.findFirst({
        where: eq(StepDefinition.userId, ctx.session.user.id),
      });

      if (!existingSteps) {
        const predefinedSteps = [
          { name: "Interviews", type: "numeric" as const, sortOrder: 0 },
          { name: "HR Responses", type: "numeric" as const, sortOrder: 1 },
          { name: "Vacancy Responses", type: "numeric" as const, sortOrder: 2 },
          { name: "Code Commits", type: "numeric" as const, sortOrder: 3 },
          {
            name: "Coding Time (hours)",
            type: "numeric" as const,
            sortOrder: 4,
          },
          {
            name: "English Study (minutes)",
            type: "numeric" as const,
            sortOrder: 5,
          },
          { name: "New Knowledge", type: "text" as const, sortOrder: 6 },
        ];

        await ctx.db.insert(StepDefinition).values(
          predefinedSteps.map((step) => ({
            userId: ctx.session.user.id,
            name: step.name,
            type: step.type,
            isPredefined: true,
            sortOrder: step.sortOrder,
            isActive: true,
          })),
        );
      }

      return journey ?? null;
    }),

  /** Finish the active journey with optional offer details. */
  finish: protectedProcedure
    .input(
      z.object({
        companyName: z.string().max(256).optional(),
        offerDetails: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const active = await ctx.db.query.Journey.findFirst({
        where: and(
          eq(Journey.userId, ctx.session.user.id),
          eq(Journey.status, "active"),
        ),
      });
      if (!active) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active journey to finish",
        });
      }

      const today = new Date().toISOString().slice(0, 10);
      const [journey] = await ctx.db
        .update(Journey)
        .set({
          status: "completed",
          endDate: today,
          companyName: input.companyName ?? null,
          offerDetails: input.offerDetails ?? null,
        })
        .where(eq(Journey.id, active.id))
        .returning();

      return journey ?? null;
    }),

  /** Update offer details on a completed journey. */
  updateDetails: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        companyName: z.string().max(256).nullable(),
        offerDetails: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const journey = await ctx.db.query.Journey.findFirst({
        where: and(
          eq(Journey.id, input.id),
          eq(Journey.userId, ctx.session.user.id),
        ),
      });
      if (!journey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Journey not found",
        });
      }

      const [updated] = await ctx.db
        .update(Journey)
        .set({
          companyName: input.companyName,
          offerDetails: input.offerDetails,
        })
        .where(eq(Journey.id, input.id))
        .returning();

      return updated ?? null;
    }),
} satisfies TRPCRouterRecord;

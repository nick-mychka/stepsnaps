import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, asc, eq } from "@stepsnaps/db";
import { Challenge } from "@stepsnaps/db/schema";

import { protectedProcedure } from "../trpc";

/** Weekday indices in JS Date convention: 0 = Sunday … 6 = Saturday. */
const scheduledDaysSchema = z
  .array(z.number().int().min(0).max(6))
  .min(1)
  .refine((days) => new Set(days).size === days.length, {
    message: "Scheduled days must be unique",
  });

export const challengeRouter = {
  /** List the current user's active challenges, oldest first. */
  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.Challenge.findMany({
      where: and(
        eq(Challenge.userId, ctx.session.user.id),
        eq(Challenge.status, "active"),
      ),
      orderBy: asc(Challenge.createdAt),
    });
  }),

  /** Create a challenge owned by the current user. */
  create: protectedProcedure
    .input(
      z
        .object({
          name: z.string().min(1).max(256),
          description: z.string().max(2000).optional(),
          startDate: z.string().date(),
          endDate: z.string().date().optional(),
          scheduledDays: scheduledDaysSchema,
        })
        .refine((input) => !input.endDate || input.endDate >= input.startDate, {
          message: "End date must not be before the start date",
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(Challenge)
        .values({
          userId: ctx.session.user.id,
          name: input.name,
          description: input.description,
          startDate: input.startDate,
          endDate: input.endDate,
          scheduledDays: [...input.scheduledDays].sort((a, b) => a - b),
        })
        .returning();

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create challenge",
        });
      }

      return created;
    }),
} satisfies TRPCRouterRecord;

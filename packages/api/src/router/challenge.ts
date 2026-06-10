import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, asc, eq } from "@stepsnaps/db";
import { Challenge, ChallengeCompletion } from "@stepsnaps/db/schema";

import { protectedProcedure } from "../trpc";

/** Weekday indices in JS Date convention: 0 = Sunday … 6 = Saturday. */
const scheduledDaysSchema = z
  .array(z.number().int().min(0).max(6))
  .min(1)
  .refine((days) => new Set(days).size === days.length, {
    message: "Scheduled days must be unique",
  });

const DAY_MS = 24 * 60 * 60 * 1000;

/** Shift an ISO date string by whole days (ISO dates parse as UTC midnight). */
function shiftDate(date: string, days: number): string {
  return new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10);
}

/**
 * The client-reported local date is trusted as the effective "today" as long
 * as it stays within ±1 day of server time — a sanity bound against clock
 * skew, not a security boundary.
 */
function assertClientToday(clientToday: string) {
  const serverToday = new Date().toISOString().slice(0, 10);
  if (Math.abs(Date.parse(clientToday) - Date.parse(serverToday)) > DAY_MS) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Client date is too far from server time",
    });
  }
}

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

  /** Get one of the current user's challenges with its completions. */
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const challenge = await ctx.db.query.Challenge.findFirst({
        where: and(
          eq(Challenge.id, input.id),
          eq(Challenge.userId, ctx.session.user.id),
        ),
        with: { completions: { orderBy: asc(ChallengeCompletion.date) } },
      });

      if (!challenge) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Challenge not found",
        });
      }

      return challenge;
    }),

  /**
   * Mark or un-mark a day as completed. `today` is the client's local date
   * (validated within ±1 day of server time); the target `date` must be that
   * today or the day before, fall on a scheduled weekday, and lie within the
   * challenge's date range. Marking is idempotent; un-marking deletes the row.
   */
  toggleCompletion: protectedProcedure
    .input(
      z.object({
        challengeId: z.string().uuid(),
        date: z.string().date(),
        today: z.string().date(),
        completed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      assertClientToday(input.today);

      if (
        input.date !== input.today &&
        input.date !== shiftDate(input.today, -1)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only today and yesterday can be changed",
        });
      }

      const challenge = await ctx.db.query.Challenge.findFirst({
        where: and(
          eq(Challenge.id, input.challengeId),
          eq(Challenge.userId, ctx.session.user.id),
        ),
      });

      if (!challenge) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Challenge not found",
        });
      }

      if (challenge.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Challenge is not active",
        });
      }

      if (
        input.date < challenge.startDate ||
        (challenge.endDate && input.date > challenge.endDate)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Date is outside the challenge period",
        });
      }

      const weekday = new Date(`${input.date}T00:00:00Z`).getUTCDay();
      if (!challenge.scheduledDays.includes(weekday)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Date is not a scheduled day",
        });
      }

      if (input.completed) {
        await ctx.db
          .insert(ChallengeCompletion)
          .values({ challengeId: challenge.id, date: input.date })
          .onConflictDoNothing();
      } else {
        await ctx.db
          .delete(ChallengeCompletion)
          .where(
            and(
              eq(ChallengeCompletion.challengeId, challenge.id),
              eq(ChallengeCompletion.date, input.date),
            ),
          );
      }

      return { success: true };
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

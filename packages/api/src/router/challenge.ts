import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import type { db } from "@stepsnaps/db/client";
import { and, asc, desc, eq, inArray, isNotNull, lt } from "@stepsnaps/db";
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

/**
 * Lazily persist `active → completed` for the user's challenges whose end
 * date has passed (no cron; runs opportunistically on reads). `updatedAt`
 * records when the transition was noticed, which orders the history list.
 */
async function completeEndedChallenges(
  database: typeof db,
  userId: string,
  today: string,
) {
  await database
    .update(Challenge)
    .set({ status: "completed" })
    .where(
      and(
        eq(Challenge.userId, userId),
        eq(Challenge.status, "active"),
        isNotNull(Challenge.endDate),
        lt(Challenge.endDate, today),
      ),
    );
}

export const challengeRouter = {
  /** List the current user's active challenges, oldest first. */
  list: protectedProcedure
    .input(z.object({ today: z.string().date() }))
    .query(async ({ ctx, input }) => {
      assertClientToday(input.today);
      await completeEndedChallenges(ctx.db, ctx.session.user.id, input.today);

      return ctx.db.query.Challenge.findMany({
        where: and(
          eq(Challenge.userId, ctx.session.user.id),
          eq(Challenge.status, "active"),
        ),
        orderBy: asc(Challenge.createdAt),
      });
    }),

  /**
   * List the current user's past (completed or stopped) challenges, most
   * recently ended first.
   */
  listPast: protectedProcedure
    .input(z.object({ today: z.string().date() }))
    .query(async ({ ctx, input }) => {
      assertClientToday(input.today);
      await completeEndedChallenges(ctx.db, ctx.session.user.id, input.today);

      return ctx.db.query.Challenge.findMany({
        where: and(
          eq(Challenge.userId, ctx.session.user.id),
          inArray(Challenge.status, ["completed", "stopped"]),
        ),
        orderBy: [desc(Challenge.updatedAt), desc(Challenge.createdAt)],
      });
    }),

  /** Get one of the current user's challenges with its completions. */
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid(), today: z.string().date() }))
    .query(async ({ ctx, input }) => {
      assertClientToday(input.today);
      await completeEndedChallenges(ctx.db, ctx.session.user.id, input.today);

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
   * Stop an active challenge. Terminal: a stopped challenge keeps its record
   * and completions but accepts no further check-ins. A challenge whose end
   * date already passed is lazily completed first, so it can't be stopped.
   */
  stop: protectedProcedure
    .input(z.object({ id: z.string().uuid(), today: z.string().date() }))
    .mutation(async ({ ctx, input }) => {
      assertClientToday(input.today);
      await completeEndedChallenges(ctx.db, ctx.session.user.id, input.today);

      const [stopped] = await ctx.db
        .update(Challenge)
        .set({ status: "stopped" })
        .where(
          and(
            eq(Challenge.id, input.id),
            eq(Challenge.userId, ctx.session.user.id),
            eq(Challenge.status, "active"),
          ),
        )
        .returning();

      if (!stopped) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Active challenge not found",
        });
      }

      return stopped;
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

  /**
   * Edit a challenge. Name and description are always editable; the end date
   * only while the challenge is active (and never to before today); the start
   * date and schedule only until the first check-in. Unchanged fields are
   * ignored, so clients can always send the full form.
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        today: z.string().date(),
        name: z.string().min(1).max(256).optional(),
        description: z.string().max(2000).nullable().optional(),
        startDate: z.string().date().optional(),
        endDate: z.string().date().nullable().optional(),
        scheduledDays: scheduledDaysSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      assertClientToday(input.today);
      await completeEndedChallenges(ctx.db, ctx.session.user.id, input.today);

      const challenge = await ctx.db.query.Challenge.findFirst({
        where: and(
          eq(Challenge.id, input.id),
          eq(Challenge.userId, ctx.session.user.id),
        ),
        with: { completions: { limit: 1 } },
      });

      if (!challenge) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Challenge not found",
        });
      }

      const sortedDays = input.scheduledDays
        ? [...input.scheduledDays].sort((a, b) => a - b)
        : undefined;

      const nameChanged =
        input.name !== undefined && input.name !== challenge.name;
      const descriptionChanged =
        input.description !== undefined &&
        input.description !== challenge.description;
      const startDateChanged =
        input.startDate !== undefined &&
        input.startDate !== challenge.startDate;
      const endDateChanged =
        input.endDate !== undefined && input.endDate !== challenge.endDate;
      const scheduleChanged =
        sortedDays !== undefined &&
        sortedDays.join() !== [...challenge.scheduledDays].sort().join();

      if (
        (startDateChanged || endDateChanged || scheduleChanged) &&
        challenge.status !== "active"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only the name and description of a past challenge can be edited",
        });
      }

      if (
        (startDateChanged || scheduleChanged) &&
        challenge.completions.length > 0
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Start date and schedule are locked after the first check-in",
        });
      }

      if (endDateChanged && input.endDate && input.endDate < input.today) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date cannot be set before today",
        });
      }

      const finalStart = startDateChanged
        ? input.startDate
        : challenge.startDate;
      const finalEnd = endDateChanged ? input.endDate : challenge.endDate;
      if (finalStart && finalEnd && finalEnd < finalStart) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date must not be before the start date",
        });
      }

      const changes: Partial<typeof Challenge.$inferInsert> = {};
      if (nameChanged) changes.name = input.name;
      if (descriptionChanged) changes.description = input.description;
      if (startDateChanged) changes.startDate = input.startDate;
      if (endDateChanged) changes.endDate = input.endDate;
      if (scheduleChanged) changes.scheduledDays = sortedDays;

      if (Object.keys(changes).length === 0) {
        const { completions: _completions, ...unchanged } = challenge;
        return unchanged;
      }

      const [updated] = await ctx.db
        .update(Challenge)
        .set(changes)
        .where(eq(Challenge.id, challenge.id))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update challenge",
        });
      }

      return updated;
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

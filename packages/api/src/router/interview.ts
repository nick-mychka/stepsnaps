import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import type { db as _dbTypeHelper } from "@stepsnaps/db/client";
import { asc, eq, max } from "@stepsnaps/db";
import { Interview, JobApplication } from "@stepsnaps/db/schema";

import { protectedProcedure } from "../trpc";

type Db = typeof _dbTypeHelper;

/** Verify the application belongs to the authenticated user via journey ownership. */
async function verifyApplicationOwnership(
  db: Db,
  applicationId: string,
  userId: string,
) {
  const application = await db.query.JobApplication.findFirst({
    where: eq(JobApplication.id, applicationId),
    with: { journey: true },
  });

  if (application?.journey.userId !== userId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Application not found",
    });
  }

  return application;
}

export const interviewRouter = {
  /** List all interviews for an application, ordered by round asc. */
  list: protectedProcedure
    .input(z.object({ jobApplicationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await verifyApplicationOwnership(
        ctx.db,
        input.jobApplicationId,
        ctx.session.user.id,
      );

      return ctx.db.query.Interview.findMany({
        where: eq(Interview.jobApplicationId, input.jobApplicationId),
        orderBy: asc(Interview.round),
      });
    }),

  /** Create a new interview. Auto-calculates round. Auto-transitions pending -> interviewing. */
  create: protectedProcedure
    .input(
      z.object({
        jobApplicationId: z.string().uuid(),
        date: z.string().date(),
        type: z.enum([
          "phone_screen",
          "technical",
          "behavioral",
          "system_design",
          "hiring_manager",
          "other",
        ]),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const application = await verifyApplicationOwnership(
        ctx.db,
        input.jobApplicationId,
        ctx.session.user.id,
      );

      // Auto-calculate round: max existing round + 1
      const [maxResult] = await ctx.db
        .select({ maxRound: max(Interview.round) })
        .from(Interview)
        .where(eq(Interview.jobApplicationId, input.jobApplicationId));

      const nextRound = (maxResult?.maxRound ?? 0) + 1;

      const [interview] = await ctx.db
        .insert(Interview)
        .values({
          jobApplicationId: input.jobApplicationId,
          date: input.date,
          round: nextRound,
          type: input.type,
          note: input.note ?? null,
        })
        .returning();

      // Auto-transition: pending -> interviewing on first interview
      if (application.status === "pending") {
        const today = new Date().toISOString().slice(0, 10);
        await ctx.db
          .update(JobApplication)
          .set({
            status: "interviewing",
            respondedAt: today,
          })
          .where(eq(JobApplication.id, input.jobApplicationId));
      }

      return interview ?? null;
    }),

  /** Update an interview's date, type, and note. Round is not editable. */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        date: z.string().date().optional(),
        type: z
          .enum([
            "phone_screen",
            "technical",
            "behavioral",
            "system_design",
            "hiring_manager",
            "other",
          ])
          .optional(),
        note: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find the interview and verify ownership
      const interview = await ctx.db.query.Interview.findFirst({
        where: eq(Interview.id, input.id),
      });

      if (!interview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interview not found",
        });
      }

      await verifyApplicationOwnership(
        ctx.db,
        interview.jobApplicationId,
        ctx.session.user.id,
      );

      const { id, ...fields } = input;

      const [updated] = await ctx.db
        .update(Interview)
        .set(fields)
        .where(eq(Interview.id, id))
        .returning();

      return updated ?? null;
    }),

  /** Delete an interview. */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const interview = await ctx.db.query.Interview.findFirst({
        where: eq(Interview.id, input.id),
      });

      if (!interview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interview not found",
        });
      }

      await verifyApplicationOwnership(
        ctx.db,
        interview.jobApplicationId,
        ctx.session.user.id,
      );

      await ctx.db.delete(Interview).where(eq(Interview.id, input.id));

      return { success: true };
    }),
} satisfies TRPCRouterRecord;

import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, count, desc, eq } from "@stepsnaps/db";
import { JobApplication, Journey } from "@stepsnaps/db/schema";

import { protectedProcedure } from "../trpc";

const PER_PAGE = 25;

export const jobApplicationRouter = {
  /** Paginated list of active (non-closed) applications for the user's active journey. */
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Find user's active journey
      const journey = await ctx.db.query.Journey.findFirst({
        where: and(
          eq(Journey.userId, ctx.session.user.id),
          eq(Journey.status, "active"),
        ),
      });

      if (!journey) {
        return { items: [], total: 0, page: input.page, perPage: PER_PAGE };
      }

      const offset = (input.page - 1) * PER_PAGE;

      const [items, totalResult] = await Promise.all([
        ctx.db.query.JobApplication.findMany({
          where: and(
            eq(JobApplication.journeyId, journey.id),
            // Exclude closed — we only show active apps in this phase
          ),
          orderBy: desc(JobApplication.appliedAt),
          limit: PER_PAGE,
          offset,
          with: {
            source: true,
          },
        }),
        ctx.db
          .select({ count: count() })
          .from(JobApplication)
          .where(eq(JobApplication.journeyId, journey.id)),
      ]);

      return {
        items,
        total: totalResult[0]?.count ?? 0,
        page: input.page,
        perPage: PER_PAGE,
      };
    }),

  /** Create a new job application for the user's active journey. */
  create: protectedProcedure
    .input(
      z.object({
        companyName: z.string().min(1).max(256),
        jobTitle: z.string().max(256).optional(),
        salary: z.string().max(256).optional(),
        workMode: z.enum(["remote", "onsite", "hybrid"]).default("remote"),
        jobUrl: z.string().url().optional().or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find user's active journey
      const journey = await ctx.db.query.Journey.findFirst({
        where: and(
          eq(Journey.userId, ctx.session.user.id),
          eq(Journey.status, "active"),
        ),
      });

      if (!journey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active journey found",
        });
      }

      const today = new Date().toISOString().slice(0, 10);

      const [application] = await ctx.db
        .insert(JobApplication)
        .values({
          journeyId: journey.id,
          companyName: input.companyName,
          jobTitle: input.jobTitle ?? null,
          salary: input.salary ?? null,
          workMode: input.workMode,
          jobUrl: input.jobUrl ?? null,
          appliedAt: today,
          status: "pending",
        })
        .returning();

      return application ?? null;
    }),
} satisfies TRPCRouterRecord;

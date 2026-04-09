import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, count, desc, eq, ne } from "@stepsnaps/db";
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
            ne(JobApplication.status, "closed"),
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
          .where(
            and(
              eq(JobApplication.journeyId, journey.id),
              ne(JobApplication.status, "closed"),
            ),
          ),
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

  /** Get a single application by ID, with ownership check. */
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const application = await ctx.db.query.JobApplication.findFirst({
        where: eq(JobApplication.id, input.id),
        with: {
          journey: true,
          source: true,
          interviews: true,
        },
      });

      if (application?.journey.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      return application;
    }),

  /** Update application fields and optionally change status to on_hold. */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        companyName: z.string().min(1).max(256).optional(),
        jobTitle: z.string().max(256).optional().nullable(),
        salary: z.string().max(256).optional().nullable(),
        workMode: z.enum(["remote", "onsite", "hybrid"]).optional(),
        jobUrl: z.string().url().optional().nullable().or(z.literal("")),
        status: z.enum(["on_hold", "interviewing"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.JobApplication.findFirst({
        where: eq(JobApplication.id, input.id),
        with: { journey: true },
      });

      if (existing?.journey.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      // Validate status transition if changing status
      if (input.status) {
        const validTransitions: Record<string, string[]> = {
          pending: ["on_hold"],
          interviewing: ["on_hold"],
          on_hold: ["interviewing"],
          closed: [],
        };

        const allowed = validTransitions[existing.status] ?? [];
        if (!allowed.includes(input.status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot transition from "${existing.status}" to "${input.status}"`,
          });
        }
      }

      const { id, status, ...fields } = input;

      const [updated] = await ctx.db
        .update(JobApplication)
        .set({
          ...fields,
          ...(status ? { status } : {}),
        })
        .where(eq(JobApplication.id, id))
        .returning();

      return updated ?? null;
    }),

  /** Close an application with a reason. */
  close: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        closedReason: z.enum([
          "rejected",
          "withdrawn",
          "no_response",
          "success",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.JobApplication.findFirst({
        where: eq(JobApplication.id, input.id),
        with: { journey: true },
      });

      if (existing?.journey.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      // Only interviewing and on_hold can be closed
      if (existing.status !== "interviewing" && existing.status !== "on_hold") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot close an application with status "${existing.status}"`,
        });
      }

      const [closed] = await ctx.db
        .update(JobApplication)
        .set({
          status: "closed",
          closedReason: input.closedReason,
        })
        .where(eq(JobApplication.id, input.id))
        .returning();

      return closed ?? null;
    }),
} satisfies TRPCRouterRecord;

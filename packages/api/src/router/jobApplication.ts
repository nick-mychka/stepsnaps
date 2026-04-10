import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import type { db as _dbTypeHelper } from "@stepsnaps/db/client";
import { and, count, desc, eq, ilike, ne, sql } from "@stepsnaps/db";
import { JobApplication, Journey, Source } from "@stepsnaps/db/schema";

import { protectedProcedure } from "../trpc";

type Db = typeof _dbTypeHelper;

const PER_PAGE = 25;

/** Find or create a source by name (case-insensitive) for a user. */
async function findOrCreateSource(
  db: Db,
  userId: string,
  name: string,
): Promise<string> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Source name cannot be empty");

  // Case-insensitive lookup
  const existing = await db.query.Source.findFirst({
    where: and(
      eq(Source.userId, userId),
      eq(sql`lower(${Source.name})`, trimmed.toLowerCase()),
    ),
  });

  if (existing) return existing.id;

  const [created] = await db
    .insert(Source)
    .values({ userId, name: trimmed })
    .returning();

  return created?.id ?? "";
}

/** Seed "LinkedIn" as a default source if the user has no sources yet. */
async function seedDefaultSources(db: Db, userId: string) {
  const existing = await db.query.Source.findFirst({
    where: eq(Source.userId, userId),
  });
  if (!existing) {
    await db.insert(Source).values({ userId, name: "LinkedIn" });
  }
}

export const jobApplicationRouter = {
  /** Paginated list of applications for the user's active journey. */
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        tab: z.enum(["active", "closed"]).default("active"),
        status: z.enum(["pending", "interviewing", "on_hold"]).optional(),
        search: z.string().max(256).optional(),
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

      // Build where conditions
      const conditions = [eq(JobApplication.journeyId, journey.id)];

      if (input.tab === "closed") {
        conditions.push(eq(JobApplication.status, "closed"));
      } else if (input.status) {
        // Filter by specific active status
        conditions.push(eq(JobApplication.status, input.status));
      } else {
        conditions.push(ne(JobApplication.status, "closed"));
      }

      if (input.search?.trim()) {
        conditions.push(
          ilike(JobApplication.companyName, `%${input.search.trim()}%`),
        );
      }

      const whereClause = and(...conditions);

      const [items, totalResult] = await Promise.all([
        ctx.db.query.JobApplication.findMany({
          where: whereClause,
          orderBy: desc(JobApplication.appliedAt),
          limit: PER_PAGE,
          offset,
          with: {
            source: true,
            interviews: {
              columns: { id: true },
            },
          },
        }),
        ctx.db
          .select({ count: count() })
          .from(JobApplication)
          .where(whereClause),
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
        sourceName: z.string().max(256).optional(),
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

      // Seed default sources on first use
      await seedDefaultSources(ctx.db, ctx.session.user.id);

      // Find or create source if provided
      let sourceId: string | null = null;
      if (input.sourceName?.trim()) {
        sourceId = await findOrCreateSource(
          ctx.db,
          ctx.session.user.id,
          input.sourceName,
        );
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
          sourceId,
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
        sourceName: z.string().max(256).optional().nullable(),
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

      // Resolve source
      let sourceId: string | null | undefined;
      if (input.sourceName === null || input.sourceName === "") {
        sourceId = null; // Clear source
      } else if (input.sourceName) {
        sourceId = await findOrCreateSource(
          ctx.db,
          ctx.session.user.id,
          input.sourceName,
        );
      }

      const { id, status, sourceName: _sourceName, ...fields } = input;

      const [updated] = await ctx.db
        .update(JobApplication)
        .set({
          ...fields,
          ...(sourceId !== undefined ? { sourceId } : {}),
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

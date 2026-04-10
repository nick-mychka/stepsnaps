import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import type { db as _dbTypeHelper } from "@stepsnaps/db/client";
import { asc, eq } from "@stepsnaps/db";
import { Source } from "@stepsnaps/db/schema";

import { protectedProcedure } from "../trpc";

type Db = typeof _dbTypeHelper;

/** Seed "LinkedIn" as a default source if the user has no sources yet. */
async function seedDefaultSources(db: Db, userId: string) {
  const existing = await db.query.Source.findFirst({
    where: eq(Source.userId, userId),
  });
  if (!existing) {
    await db.insert(Source).values({ userId, name: "LinkedIn" });
  }
}

export const sourceRouter = {
  /** Search sources by name (ILIKE), limit 10. */
  search: protectedProcedure
    .input(z.object({ query: z.string().max(256) }))
    .query(async ({ ctx, input }) => {
      // Seed default sources on first use
      await seedDefaultSources(ctx.db, ctx.session.user.id);

      if (!input.query.trim()) {
        // Return all sources when query is empty
        return ctx.db.query.Source.findMany({
          where: eq(Source.userId, ctx.session.user.id),
          orderBy: asc(Source.name),
          limit: 10,
        });
      }

      return ctx.db.query.Source.findMany({
        where: (s, { and, eq, ilike }) =>
          and(
            eq(s.userId, ctx.session.user.id),
            ilike(s.name, `%${input.query.trim()}%`),
          ),
        orderBy: asc(Source.name),
        limit: 10,
      });
    }),

  /** List all sources for the current user. */
  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.Source.findMany({
      where: eq(Source.userId, ctx.session.user.id),
      orderBy: asc(Source.name),
    });
  }),
} satisfies TRPCRouterRecord;

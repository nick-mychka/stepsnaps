import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { asc, eq } from "@stepsnaps/db";
import { Source } from "@stepsnaps/db/schema";

import { protectedProcedure } from "../trpc";

export const sourceRouter = {
  /** Search sources by name (ILIKE), limit 10. */
  search: protectedProcedure
    .input(z.object({ query: z.string().max(256) }))
    .query(async ({ ctx, input }) => {
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

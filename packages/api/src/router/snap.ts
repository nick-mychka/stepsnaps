import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, asc, eq } from "@stepsnaps/db";
import { Journey, Snap, SnapValue } from "@stepsnaps/db/schema";

import { protectedProcedure } from "../trpc";

export const snapRouter = {
  /** Get a snap for a specific date within a journey (with values). */
  byDate: protectedProcedure
    .input(z.object({ journeyId: z.string().uuid(), date: z.string().date() }))
    .query(async ({ ctx, input }) => {
      // Verify journey belongs to user
      const journey = await ctx.db.query.Journey.findFirst({
        where: and(
          eq(Journey.id, input.journeyId),
          eq(Journey.userId, ctx.session.user.id),
        ),
      });
      if (!journey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Journey not found",
        });
      }

      const snap = await ctx.db.query.Snap.findFirst({
        where: and(
          eq(Snap.journeyId, input.journeyId),
          eq(Snap.date, input.date),
        ),
        with: {
          values: {
            with: { stepDefinition: true },
          },
        },
      });

      return snap ?? null;
    }),

  /** List all snaps for a journey (with values), ordered by date. */
  list: protectedProcedure
    .input(z.object({ journeyId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const journey = await ctx.db.query.Journey.findFirst({
        where: and(
          eq(Journey.id, input.journeyId),
          eq(Journey.userId, ctx.session.user.id),
        ),
      });
      if (!journey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Journey not found",
        });
      }

      return ctx.db.query.Snap.findMany({
        where: eq(Snap.journeyId, input.journeyId),
        orderBy: asc(Snap.date),
        with: {
          values: {
            with: { stepDefinition: true },
          },
        },
      });
    }),

  /** Create or update a snap for a specific date. */
  upsert: protectedProcedure
    .input(
      z.object({
        journeyId: z.string().uuid(),
        date: z.string().date(),
        values: z.array(
          z.object({
            stepDefinitionId: z.string().uuid(),
            numericValue: z.string().nullable().optional(),
            textValue: z.string().nullable().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify journey belongs to user and is active
      const journey = await ctx.db.query.Journey.findFirst({
        where: and(
          eq(Journey.id, input.journeyId),
          eq(Journey.userId, ctx.session.user.id),
        ),
      });
      if (!journey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Journey not found",
        });
      }

      // Find existing snap or create one
      let snap = await ctx.db.query.Snap.findFirst({
        where: and(
          eq(Snap.journeyId, input.journeyId),
          eq(Snap.date, input.date),
        ),
      });

      if (snap) {
        // Delete existing values and re-insert
        await ctx.db.delete(SnapValue).where(eq(SnapValue.snapId, snap.id));
      } else {
        const [created] = await ctx.db
          .insert(Snap)
          .values({
            journeyId: input.journeyId,
            date: input.date,
          })
          .returning();

        if (!created) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create snap",
          });
        }
        snap = created;
      }

      // Insert new values
      if (input.values.length > 0) {
        await ctx.db.insert(SnapValue).values(
          input.values.map((v) => ({
            snapId: snap.id,
            stepDefinitionId: v.stepDefinitionId,
            numericValue: v.numericValue ?? null,
            textValue: v.textValue ?? null,
          })),
        );
      }

      // Return the snap with values
      return ctx.db.query.Snap.findFirst({
        where: eq(Snap.id, snap.id),
        with: {
          values: {
            with: { stepDefinition: true },
          },
        },
      });
    }),

  /** Delete a snap. */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify snap belongs to user's journey
      const snap = await ctx.db.query.Snap.findFirst({
        where: eq(Snap.id, input.id),
        with: { journey: true },
      });
      if (snap?.journey.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Snap not found",
        });
      }

      await ctx.db.delete(Snap).where(eq(Snap.id, input.id));
      return { success: true };
    }),
} satisfies TRPCRouterRecord;

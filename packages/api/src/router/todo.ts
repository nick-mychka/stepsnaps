import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, asc, eq } from "@stepsnaps/db";
import { Todo } from "@stepsnaps/db/schema";

import { protectedProcedure } from "../trpc";

export const todoRouter = {
  /** List the current user's to-dos for a specific date, oldest first. */
  byDate: protectedProcedure
    .input(z.object({ date: z.string().date() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Todo.findMany({
        where: and(
          eq(Todo.userId, ctx.session.user.id),
          eq(Todo.date, input.date),
        ),
        orderBy: asc(Todo.createdAt),
      });
    }),

  /** Create a to-do for the given date, owned by the current user. */
  create: protectedProcedure
    .input(
      z.object({
        date: z.string().date(),
        title: z.string().min(1).max(256),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(Todo)
        .values({
          userId: ctx.session.user.id,
          date: input.date,
          title: input.title,
        })
        .returning();

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create to-do",
        });
      }

      return created;
    }),

  /** Update a to-do's title (current user's rows only). */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(256),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(Todo)
        .set({ title: input.title })
        .where(and(eq(Todo.id, input.id), eq(Todo.userId, ctx.session.user.id)))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "To-do not found" });
      }

      return updated;
    }),

  /** Set a to-do's completed flag (current user's rows only). */
  toggle: protectedProcedure
    .input(z.object({ id: z.string().uuid(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(Todo)
        .set({ completed: input.completed })
        .where(and(eq(Todo.id, input.id), eq(Todo.userId, ctx.session.user.id)))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "To-do not found" });
      }

      return updated;
    }),

  /** Delete a to-do (current user's rows only). */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(Todo)
        .where(and(eq(Todo.id, input.id), eq(Todo.userId, ctx.session.user.id)))
        .returning();

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "To-do not found" });
      }

      return { success: true };
    }),
} satisfies TRPCRouterRecord;

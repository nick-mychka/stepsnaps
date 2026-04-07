import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, asc, desc, eq, gt } from "@stepsnaps/db";
import {
  Journey,
  Snap,
  Team,
  TeamInvite,
  TeamMember,
} from "@stepsnaps/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const teamRouter = {
  /** List teams the user is a member of or created. */
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Teams I created
    const createdTeams = await ctx.db.query.Team.findMany({
      where: eq(Team.creatorId, userId),
      with: { members: { with: { user: true } } },
      orderBy: desc(Team.createdAt),
    });

    // Teams I'm a member of (active)
    const memberships = await ctx.db.query.TeamMember.findMany({
      where: and(
        eq(TeamMember.userId, userId),
        eq(TeamMember.status, "active"),
      ),
      with: {
        team: {
          with: { members: { with: { user: true } }, creator: true },
        },
      },
    });

    // Merge, dedup by team ID
    const seen = new Set<string>();
    const teams: {
      id: string;
      name: string;
      creatorId: string;
      creatorName: string;
      isAdmin: boolean;
      memberCount: number;
    }[] = [];

    for (const t of createdTeams) {
      seen.add(t.id);
      teams.push({
        id: t.id,
        name: t.name,
        creatorId: t.creatorId,
        creatorName: ctx.session.user.name,
        isAdmin: true,
        memberCount: t.members.filter((m) => m.status === "active").length,
      });
    }

    for (const m of memberships) {
      if (!seen.has(m.team.id)) {
        seen.add(m.team.id);
        teams.push({
          id: m.team.id,
          name: m.team.name,
          creatorId: m.team.creatorId,
          creatorName: m.team.creator.name,
          isAdmin: false,
          memberCount: m.team.members.filter((mb) => mb.status === "active")
            .length,
        });
      }
    }

    return teams;
  }),

  /** Get team detail with members. Only accessible by admin or active member. */
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const team = await ctx.db.query.Team.findFirst({
        where: eq(Team.id, input.id),
        with: {
          members: { with: { user: true } },
          creator: true,
        },
      });
      if (!team) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
      }

      const userId = ctx.session.user.id;
      const isAdmin = team.creatorId === userId;
      const isMember = team.members.some(
        (m) => m.userId === userId && m.status === "active",
      );
      if (!isAdmin && !isMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not a member of this team",
        });
      }

      return {
        id: team.id,
        name: team.name,
        creatorId: team.creatorId,
        creatorName: team.creator.name,
        isAdmin,
        members: team.members.map((m) => ({
          id: m.id,
          userId: m.userId,
          name: m.user.name,
          email: m.user.email,
          image: m.user.image,
          status: m.status,
        })),
      };
    }),

  /** Create a new team. The creator becomes admin. */
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(256) }))
    .mutation(async ({ ctx, input }) => {
      const [team] = await ctx.db
        .insert(Team)
        .values({ name: input.name, creatorId: ctx.session.user.id })
        .returning();

      if (!team) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create team",
        });
      }

      // Add creator as active member too
      await ctx.db.insert(TeamMember).values({
        teamId: team.id,
        userId: ctx.session.user.id,
        status: "active",
      });

      return team;
    }),

  /** Generate an invite link. Admin only. Expires in 7 days. */
  createInvite: protectedProcedure
    .input(z.object({ teamId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const team = await ctx.db.query.Team.findFirst({
        where: eq(Team.id, input.teamId),
      });
      if (!team?.creatorId || team.creatorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only team admin can create invites",
        });
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const [invite] = await ctx.db
        .insert(TeamInvite)
        .values({
          teamId: input.teamId,
          createdBy: ctx.session.user.id,
          expiresAt,
        })
        .returning();

      if (!invite) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create invite",
        });
      }

      return invite;
    }),

  /** List active invites for a team. Admin only. */
  listInvites: protectedProcedure
    .input(z.object({ teamId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const team = await ctx.db.query.Team.findFirst({
        where: eq(Team.id, input.teamId),
      });
      if (!team?.creatorId || team.creatorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only team admin can view invites",
        });
      }

      return ctx.db.query.TeamInvite.findMany({
        where: and(
          eq(TeamInvite.teamId, input.teamId),
          gt(TeamInvite.expiresAt, new Date()),
        ),
        orderBy: desc(TeamInvite.createdAt),
      });
    }),

  /** Get invite info by token (public — used on invite landing page). */
  inviteByToken: publicProcedure
    .input(z.object({ token: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const invite = await ctx.db.query.TeamInvite.findFirst({
        where: eq(TeamInvite.token, input.token),
        with: { team: true },
      });
      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }
      if (invite.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invite has expired",
        });
      }

      return {
        teamId: invite.teamId,
        teamName: invite.team.name,
        expiresAt: invite.expiresAt,
      };
    }),

  /** Accept an invite — join the team. */
  acceptInvite: protectedProcedure
    .input(z.object({ token: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.query.TeamInvite.findFirst({
        where: eq(TeamInvite.token, input.token),
      });
      if (!invite || invite.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invite is invalid or expired",
        });
      }

      const userId = ctx.session.user.id;

      // Check if already a member
      const existing = await ctx.db.query.TeamMember.findFirst({
        where: and(
          eq(TeamMember.teamId, invite.teamId),
          eq(TeamMember.userId, userId),
        ),
      });

      if (existing) {
        // Update status to active if previously declined/pending
        if (existing.status !== "active") {
          await ctx.db
            .update(TeamMember)
            .set({ status: "active" })
            .where(eq(TeamMember.id, existing.id));
        }
      } else {
        await ctx.db.insert(TeamMember).values({
          teamId: invite.teamId,
          userId,
          status: "active",
        });
      }

      return { teamId: invite.teamId };
    }),

  /** Decline an invite. */
  declineInvite: protectedProcedure
    .input(z.object({ token: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.query.TeamInvite.findFirst({
        where: eq(TeamInvite.token, input.token),
      });
      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      const userId = ctx.session.user.id;
      const existing = await ctx.db.query.TeamMember.findFirst({
        where: and(
          eq(TeamMember.teamId, invite.teamId),
          eq(TeamMember.userId, userId),
        ),
      });

      if (existing) {
        await ctx.db
          .update(TeamMember)
          .set({ status: "declined" })
          .where(eq(TeamMember.id, existing.id));
      } else {
        await ctx.db.insert(TeamMember).values({
          teamId: invite.teamId,
          userId,
          status: "declined",
        });
      }

      return { success: true };
    }),

  /** View a teammate's progress (admin only). Returns their journey + snaps. */
  memberProgress: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify caller is admin of this team
      const team = await ctx.db.query.Team.findFirst({
        where: eq(Team.id, input.teamId),
      });
      if (!team?.creatorId || team.creatorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only team admin can view member progress",
        });
      }

      // Verify target user is an active member
      const membership = await ctx.db.query.TeamMember.findFirst({
        where: and(
          eq(TeamMember.teamId, input.teamId),
          eq(TeamMember.userId, input.userId),
          eq(TeamMember.status, "active"),
        ),
        with: { user: true },
      });
      if (!membership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found in this team",
        });
      }

      // Get their active journey
      const journey = await ctx.db.query.Journey.findFirst({
        where: and(
          eq(Journey.userId, input.userId),
          eq(Journey.status, "active"),
        ),
      });

      if (!journey) {
        return {
          memberName: membership.user.name,
          journey: null,
          snaps: [],
        };
      }

      // Get snaps for that journey
      const snaps = await ctx.db.query.Snap.findMany({
        where: eq(Snap.journeyId, journey.id),
        orderBy: asc(Snap.date),
        with: {
          values: {
            with: { stepDefinition: true },
          },
        },
      });

      return {
        memberName: membership.user.name,
        journey,
        snaps,
      };
    }),
} satisfies TRPCRouterRecord;

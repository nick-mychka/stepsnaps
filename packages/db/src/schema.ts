import { relations, sql } from "drizzle-orm";
import { pgEnum, pgTable, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { user } from "./auth-schema";

export const Post = pgTable("post", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text().notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// --- Journey ---

export const journeyStatusEnum = pgEnum("journey_status", [
  "active",
  "completed",
]);

export const Journey = pgTable("journey", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  userId: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: journeyStatusEnum().notNull().default("active"),
  startDate: t.date({ mode: "string" }).notNull(),
  endDate: t.date({ mode: "string" }),
  companyName: t.varchar({ length: 256 }),
  offerDetails: t.text(),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const journeyRelations = relations(Journey, ({ one, many }) => ({
  user: one(user, {
    fields: [Journey.userId],
    references: [user.id],
  }),
  snaps: many(Snap),
  jobApplications: many(JobApplication),
}));

// --- Step Definition ---

export const stepTypeEnum = pgEnum("step_type", ["numeric", "text"]);

export const StepDefinition = pgTable("step_definition", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  userId: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: t.varchar({ length: 256 }).notNull(),
  type: stepTypeEnum().notNull().default("numeric"),
  isPredefined: t.boolean().notNull().default(false),
  goalValue: t.numeric({ precision: 10, scale: 2 }),
  sortOrder: t.integer().notNull().default(0),
  isActive: t.boolean().notNull().default(true),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const stepDefinitionRelations = relations(StepDefinition, ({ one }) => ({
  user: one(user, {
    fields: [StepDefinition.userId],
    references: [user.id],
  }),
}));

// --- Snap ---

export const Snap = pgTable(
  "snap",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    journeyId: t
      .uuid()
      .notNull()
      .references(() => Journey.id, { onDelete: "cascade" }),
    date: t.date({ mode: "string" }).notNull(),
    createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: "date", withTimezone: true })
      .$onUpdateFn(() => sql`now()`),
  }),
  (table) => [unique().on(table.journeyId, table.date)],
);

export const snapRelations = relations(Snap, ({ one, many }) => ({
  journey: one(Journey, {
    fields: [Snap.journeyId],
    references: [Journey.id],
  }),
  values: many(SnapValue),
}));

// --- Snap Value ---

export const SnapValue = pgTable("snap_value", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  snapId: t
    .uuid()
    .notNull()
    .references(() => Snap.id, { onDelete: "cascade" }),
  stepDefinitionId: t
    .uuid()
    .notNull()
    .references(() => StepDefinition.id),
  numericValue: t.numeric({ precision: 10, scale: 2 }),
  textValue: t.text(),
  goalValue: t.numeric({ precision: 10, scale: 2 }),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
}));

export const snapValueRelations = relations(SnapValue, ({ one }) => ({
  snap: one(Snap, {
    fields: [SnapValue.snapId],
    references: [Snap.id],
  }),
  stepDefinition: one(StepDefinition, {
    fields: [SnapValue.stepDefinitionId],
    references: [StepDefinition.id],
  }),
}));

// --- Team ---

export const Team = pgTable("team", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 256 }).notNull(),
  creatorId: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const teamRelations = relations(Team, ({ one, many }) => ({
  creator: one(user, {
    fields: [Team.creatorId],
    references: [user.id],
  }),
  members: many(TeamMember),
  invites: many(TeamInvite),
}));

// --- Team Member ---

export const teamMemberStatusEnum = pgEnum("team_member_status", [
  "pending",
  "active",
  "declined",
]);

export const TeamMember = pgTable(
  "team_member",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    teamId: t
      .uuid()
      .notNull()
      .references(() => Team.id, { onDelete: "cascade" }),
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: teamMemberStatusEnum().notNull().default("pending"),
    createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: "date", withTimezone: true })
      .$onUpdateFn(() => sql`now()`),
  }),
  (table) => [unique().on(table.teamId, table.userId)],
);

export const teamMemberRelations = relations(TeamMember, ({ one }) => ({
  team: one(Team, {
    fields: [TeamMember.teamId],
    references: [Team.id],
  }),
  user: one(user, {
    fields: [TeamMember.userId],
    references: [user.id],
  }),
}));

// --- Team Invite ---

export const TeamInvite = pgTable("team_invite", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  token: t.uuid().notNull().unique().defaultRandom(),
  teamId: t
    .uuid()
    .notNull()
    .references(() => Team.id, { onDelete: "cascade" }),
  createdBy: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: t.timestamp({ withTimezone: true }).notNull(),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
}));

export const teamInviteRelations = relations(TeamInvite, ({ one }) => ({
  team: one(Team, {
    fields: [TeamInvite.teamId],
    references: [Team.id],
  }),
  createdByUser: one(user, {
    fields: [TeamInvite.createdBy],
    references: [user.id],
  }),
}));

// --- Source ---

export const Source = pgTable(
  "source",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: t.varchar({ length: 256 }).notNull(),
    createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: "date", withTimezone: true })
      .$onUpdateFn(() => sql`now()`),
  }),
  (table) => [unique().on(table.userId, table.name)],
);

export const sourceRelations = relations(Source, ({ one }) => ({
  user: one(user, {
    fields: [Source.userId],
    references: [user.id],
  }),
}));

// --- Job Application ---

export const workModeEnum = pgEnum("work_mode", ["remote", "onsite", "hybrid"]);

export const jobApplicationStatusEnum = pgEnum("job_application_status", [
  "pending",
  "interviewing",
  "on_hold",
  "closed",
]);

export const closedReasonEnum = pgEnum("closed_reason", [
  "rejected",
  "withdrawn",
  "no_response",
  "success",
]);

export const JobApplication = pgTable("job_application", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  journeyId: t
    .uuid()
    .notNull()
    .references(() => Journey.id, { onDelete: "cascade" }),
  companyName: t.varchar({ length: 256 }).notNull(),
  jobTitle: t.varchar({ length: 256 }),
  salary: t.varchar({ length: 256 }),
  workMode: workModeEnum().notNull().default("remote"),
  jobUrl: t.text(),
  sourceId: t.uuid().references(() => Source.id, { onDelete: "set null" }),
  appliedAt: t.date({ mode: "string" }).notNull(),
  respondedAt: t.date({ mode: "string" }),
  status: jobApplicationStatusEnum().notNull().default("pending"),
  closedReason: closedReasonEnum(),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const jobApplicationRelations = relations(
  JobApplication,
  ({ one, many }) => ({
    journey: one(Journey, {
      fields: [JobApplication.journeyId],
      references: [Journey.id],
    }),
    source: one(Source, {
      fields: [JobApplication.sourceId],
      references: [Source.id],
    }),
    interviews: many(Interview),
  }),
);

// --- Interview ---

export const interviewTypeEnum = pgEnum("interview_type", [
  "phone_screen",
  "technical",
  "behavioral",
  "system_design",
  "hiring_manager",
  "other",
]);

export const Interview = pgTable("interview", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  jobApplicationId: t
    .uuid()
    .notNull()
    .references(() => JobApplication.id, { onDelete: "cascade" }),
  date: t.date({ mode: "string" }).notNull(),
  round: t.integer().notNull(),
  type: interviewTypeEnum().notNull(),
  note: t.text(),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const interviewRelations = relations(Interview, ({ one }) => ({
  jobApplication: one(JobApplication, {
    fields: [Interview.jobApplicationId],
    references: [JobApplication.id],
  }),
}));

export * from "./auth-schema";

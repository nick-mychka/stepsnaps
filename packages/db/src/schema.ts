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

export * from "./auth-schema";

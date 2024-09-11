import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
  interval,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const Post = pgTable("post", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  title: varchar("name", { length: 256 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
});

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const User = pgTable("user", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    withTimezone: true,
  }),
  image: varchar("image", { length: 255 }),
});

export const UserRelations = relations(User, ({ many }) => ({
  accounts: many(Account),
  windowActivities: many(WindowActivity),
  applicationUsages: many(ApplicationUsage),
}));

export const Account = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const AccountRelations = relations(Account, ({ one }) => ({
  user: one(User, { fields: [Account.userId], references: [User.id] }),
}));

export const Session = pgTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  expires: timestamp("expires", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

export const SessionRelations = relations(Session, ({ one }) => ({
  user: one(User, { fields: [Session.userId], references: [User.id] }),
}));

// New tables for time tracking

export const WindowActivity = pgTable("window_activity", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  windowTitle: varchar("window_title", { length: 512 }).notNull(),
  applicationName: varchar("application_name", { length: 255 }).notNull(),
  url: varchar("url", { length: 2048 }),
  startTime: timestamp("start_time", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  endTime: timestamp("end_time", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  duration: interval("duration").notNull(),
});

export const WindowActivityRelations = relations(WindowActivity, ({ one }) => ({
  user: one(User, { fields: [WindowActivity.userId], references: [User.id] }),
}));

export const ApplicationUsage = pgTable("application_usage", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  applicationName: varchar("application_name", { length: 255 }).notNull(),
  date: timestamp("date", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  totalDuration: interval("total_duration").notNull(),
});

export const ApplicationUsageRelations = relations(ApplicationUsage, ({ one }) => ({
  user: one(User, { fields: [ApplicationUsage.userId], references: [User.id] }),
}));

export const CreateWindowActivitySchema = createInsertSchema(WindowActivity, {
  windowTitle: z.string().max(512),
  applicationName: z.string().max(255),
  url: z.string().max(2048).optional(),
  startTime: z.date(),
  endTime: z.date(),
  duration: z.string(), // Interval is represented as a string in the schema
}).omit({
  id: true,
});

export const CreateApplicationUsageSchema = createInsertSchema(ApplicationUsage, {
  applicationName: z.string().max(255),
  date: z.date(),
  totalDuration: z.string(), // Interval is represented as a string in the schema
}).omit({
  id: true,
});
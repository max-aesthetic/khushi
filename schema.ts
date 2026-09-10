import { pgTable, uuid, text, timestamp, date, boolean } from "drizzle-orm/pg-core";

export const journals = pgTable("journals", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  shareToken: uuid("share_token").defaultRandom().notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const entries = pgTable("entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  journalId: uuid("journal_id")
    .references(() => journals.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  entryDate: date("entry_date").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const shareTokens = pgTable("share_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  journalId: uuid("journal_id")
    .references(() => journals.id, { onDelete: "cascade" })
    .notNull(),
  token: uuid("token").defaultRandom().notNull().unique(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Journal = typeof journals.$inferSelect;
export type Entry = typeof entries.$inferSelect;
export type ShareToken = typeof shareTokens.$inferSelect;

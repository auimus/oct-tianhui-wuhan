import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const feedItems = sqliteTable("feed_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  category: text("category", {
    enum: ["开发进展", "商业", "交通", "教育医疗", "生态文旅", "片区规划"],
  }).notNull(),
  summary: text("summary").notNull(),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull().unique(),
  publishedDate: text("published_date"),
  fetchedAt: integer("fetched_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const bookmarks = sqliteTable("bookmarks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  feedItemId: integer("feed_item_id")
    .notNull()
    .unique()
    .references(() => feedItems.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const refreshLogs = sqliteTable("refresh_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  status: text("status", { enum: ["started", "saved", "failed"] }).notNull(),
  message: text("message"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

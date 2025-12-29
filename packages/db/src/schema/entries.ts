import { pgTable, serial, varchar, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  importSource: varchar("import_source", { length: 50 }),
  importDate: timestamp("import_date"),
}, (table) => ({
  createdAtIdx: index("idx_entries_created_at").on(table.createdAt.desc()),
  userCreatedIdx: index("idx_entries_user_created").on(table.userId, table.createdAt.desc()),
  // Cursor pagination index
  cursorIdx: index("idx_entries_cursor").on(table.createdAt.desc(), table.id.desc()),
}));

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;

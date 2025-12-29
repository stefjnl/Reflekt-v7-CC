import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  hashedPassword: varchar("hashed_password").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  googleCredentials: text("google_credentials"),
  keepEmail: varchar("keep_email", { length: 255 }),
  keepMasterToken: text("keep_master_token"),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

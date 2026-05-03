import { pgTable, serial, text, real, boolean, timestamp } from "drizzle-orm/pg-core";

export const leaderboardBoostsTable = pgTable("leaderboard_boosts", {
  id: serial("id").primaryKey(),
  guestName: text("guest_name").notNull(),
  price: real("price").notNull().default(4.99),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

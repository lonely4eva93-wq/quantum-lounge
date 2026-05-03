import { pgTable, serial, text, real, boolean, timestamp } from "drizzle-orm/pg-core";

export const vipMembershipsTable = pgTable("vip_memberships", {
  id: serial("id").primaryKey(),
  guestName: text("guest_name").notNull(),
  email: text("email").notNull(),
  tier: text("tier").notNull().default("silver"),
  pricePerMonth: real("price_per_month").notNull(),
  status: text("status").notNull().default("active"),
  perks: text("perks").notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

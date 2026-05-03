import { pgTable, serial, text, real, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const referralCodesTable = pgTable("referral_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  ownerGuestName: text("owner_guest_name").notNull(),
  discountAmount: real("discount_amount").notNull(),
  usesCount: integer("uses_count").notNull().default(0),
  maxUses: integer("max_uses"),
  rewardAmount: real("reward_amount").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

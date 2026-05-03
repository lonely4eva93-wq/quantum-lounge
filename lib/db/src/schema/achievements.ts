import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { guestsTable } from "./guests";

export const BADGES = [
  { id: "first_checkin", label: "First Materialization", icon: "👁", description: "Entered the Quantum Lounge for the first time" },
  { id: "vip_member", label: "VIP Entity", icon: "👑", description: "Holds an active VIP membership" },
  { id: "oracle_seeker", label: "Oracle Seeker", icon: "🔮", description: "Received a Quantum Oracle reading" },
  { id: "teleporter", label: "Dimension Jumper", icon: "🌀", description: "Teleported between rooms" },
  { id: "energy_charged", label: "Charged", icon: "⚡", description: "Reached the Charged energy level" },
  { id: "energy_quantum", label: "Quantum Being", icon: "✨", description: "Reached the Quantum energy level" },
  { id: "energy_transcended", label: "Transcended", icon: "🌌", description: "Reached the Transcended energy level" },
  { id: "messenger", label: "Frequency Transmitter", icon: "📡", description: "Sent 5 quantum messages" },
  { id: "booster", label: "Signal Amplifier", icon: "🚀", description: "Purchased a leaderboard boost" },
  { id: "tipper", label: "Quantum Philanthropist", icon: "💫", description: "Tipped another guest" },
  { id: "premium_dm", label: "Encrypted Courier", icon: "💌", description: "Sent a premium encrypted message" },
  { id: "veteran", label: "Void Veteran", icon: "🏆", description: "Checked in 5 or more times" },
] as const;

export type BadgeId = typeof BADGES[number]["id"];

export const guestAchievementsTable = pgTable("guest_achievements", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").notNull().references(() => guestsTable.id),
  badgeId: text("badge_id").notNull(),
  awardedAt: timestamp("awarded_at").notNull().defaultNow(),
});

export const insertAchievementSchema = createInsertSchema(guestAchievementsTable).omit({ id: true, awardedAt: true });
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type GuestAchievement = typeof guestAchievementsTable.$inferSelect;

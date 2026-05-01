import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { guestsTable } from "./guests";

export const energyUpgradesTable = pgTable("energy_upgrades", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  level: text("level").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  color: text("color").notNull().default("#7C3AED"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const guestUpgradesTable = pgTable("guest_upgrades", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").notNull().references(() => guestsTable.id),
  upgradeId: integer("upgrade_id").notNull().references(() => energyUpgradesTable.id),
  amountPaid: real("amount_paid").notNull(),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
});

export const insertEnergyUpgradeSchema = createInsertSchema(energyUpgradesTable).omit({ id: true, createdAt: true });
export type InsertEnergyUpgrade = z.infer<typeof insertEnergyUpgradeSchema>;
export type EnergyUpgrade = typeof energyUpgradesTable.$inferSelect;

export const insertGuestUpgradeSchema = createInsertSchema(guestUpgradesTable).omit({ id: true, purchasedAt: true });
export type InsertGuestUpgrade = z.infer<typeof insertGuestUpgradeSchema>;
export type GuestUpgrade = typeof guestUpgradesTable.$inferSelect;

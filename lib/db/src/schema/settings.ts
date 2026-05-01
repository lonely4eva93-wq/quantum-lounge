import { pgTable, serial, text, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  loungeName: text("lounge_name").notNull().default("Quantum Lounge"),
  tagline: text("tagline").notNull().default("Where minds meet across dimensions"),
  houseFee: real("house_fee").notNull().default(15),
  ownerName: text("owner_name").notNull().default("The Architect"),
  theme: text("theme").notNull().default("cosmic"),
  isOpen: boolean("is_open").notNull().default(true),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;

import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { roomsTable } from "./rooms";

export const guestsTable = pgTable("guests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  vibe: text("vibe").notNull().default("curious"),
  energyLevel: text("energy_level").notNull().default("basic"),
  roomId: integer("room_id").references(() => roomsTable.id),
  status: text("status").notNull().default("active"),
  feePaid: real("fee_paid").notNull().default(0),
  checkedInAt: timestamp("checked_in_at").notNull().defaultNow(),
  checkedOutAt: timestamp("checked_out_at"),
});

export const insertGuestSchema = createInsertSchema(guestsTable).omit({ id: true, checkedInAt: true });
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Guest = typeof guestsTable.$inferSelect;

import { pgTable, serial, integer, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { guestsTable } from "./guests";
import { roomsTable } from "./rooms";

export const teleportEventsTable = pgTable("teleport_events", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").notNull().references(() => guestsTable.id),
  fromRoomId: integer("from_room_id").references(() => roomsTable.id),
  toRoomId: integer("to_room_id").notNull().references(() => roomsTable.id),
  quantumShift: real("quantum_shift").notNull().default(0),
  teleportedAt: timestamp("teleported_at").notNull().defaultNow(),
});

export const insertTeleportEventSchema = createInsertSchema(teleportEventsTable).omit({ id: true, teleportedAt: true });
export type InsertTeleportEvent = z.infer<typeof insertTeleportEventSchema>;
export type TeleportEvent = typeof teleportEventsTable.$inferSelect;

import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { roomsTable } from "./rooms";
import { guestsTable } from "./guests";

export const roomChatTable = pgTable("room_chat", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => roomsTable.id),
  guestId: integer("guest_id").references(() => guestsTable.id),
  guestName: text("guest_name").notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

export const insertChatSchema = createInsertSchema(roomChatTable).omit({ id: true, sentAt: true });
export type InsertChat = z.infer<typeof insertChatSchema>;
export type RoomChat = typeof roomChatTable.$inferSelect;

import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { roomsTable } from "./rooms";

export const roomEventsTable = pgTable("room_events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  roomId: integer("room_id").references(() => roomsTable.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRoomEventSchema = createInsertSchema(roomEventsTable).omit({ id: true, createdAt: true });
export type InsertRoomEvent = z.infer<typeof insertRoomEventSchema>;
export type RoomEvent = typeof roomEventsTable.$inferSelect;

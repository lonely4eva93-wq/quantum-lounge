import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { roomsTable } from "./rooms";

export const roomRentalsTable = pgTable("room_rentals", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => roomsTable.id),
  renterName: text("renter_name").notNull(),
  eventName: text("event_name").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  priceTotal: real("price_total").notNull(),
  status: text("status").notNull().default("confirmed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

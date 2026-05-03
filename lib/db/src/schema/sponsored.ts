import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { roomsTable } from "./rooms";

export const sponsoredRoomsTable = pgTable("sponsored_rooms", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => roomsTable.id),
  sponsorName: text("sponsor_name").notNull(),
  brandColor: text("brand_color").notNull().default("#7C3AED"),
  tagline: text("tagline").notNull(),
  pricePerMonth: real("price_per_month").notNull(),
  status: text("status").notNull().default("active"),
  startsAt: timestamp("starts_at").notNull().defaultNow(),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

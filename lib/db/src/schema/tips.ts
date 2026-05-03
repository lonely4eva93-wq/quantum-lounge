import { pgTable, serial, text, real, boolean, timestamp } from "drizzle-orm/pg-core";

export const tipsTable = pgTable("tips", {
  id: serial("id").primaryKey(),
  fromGuestName: text("from_guest_name").notNull(),
  toGuestName: text("to_guest_name"),
  toHouse: boolean("to_house").notNull().default(false),
  amount: real("amount").notNull(),
  houseCut: real("house_cut").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

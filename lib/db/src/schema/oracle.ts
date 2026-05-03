import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";

export const oracleReadingsTable = pgTable("oracle_readings", {
  id: serial("id").primaryKey(),
  guestName: text("guest_name").notNull(),
  vibe: text("vibe").notNull(),
  energyLevel: text("energy_level").notNull(),
  reading: text("reading").notNull(),
  frequency: real("frequency").notNull(),
  cosmicSignature: text("cosmic_signature").notNull(),
  price: real("price").notNull().default(2.99),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

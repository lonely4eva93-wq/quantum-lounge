import { pgTable, serial, text, real, boolean, timestamp } from "drizzle-orm/pg-core";

export const premiumMessagesTable = pgTable("premium_messages", {
  id: serial("id").primaryKey(),
  fromGuestName: text("from_guest_name").notNull(),
  toGuestName: text("to_guest_name").notNull(),
  content: text("content").notNull(),
  price: real("price").notNull().default(0.99),
  quantumSignature: text("quantum_signature").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

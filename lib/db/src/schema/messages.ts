import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { roomsTable } from "./rooms";

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderName: text("sender_name").notNull(),
  content: text("content").notNull(),
  roomId: integer("room_id").references(() => roomsTable.id),
  isEncrypted: boolean("is_encrypted").notNull().default(true),
  quantumSignature: text("quantum_signature").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, sentAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;

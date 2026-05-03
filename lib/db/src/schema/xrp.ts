import { pgTable, serial, text, real, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { guestsTable } from "./guests";

export const xrpAccountsTable = pgTable("xrp_accounts", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").notNull().references(() => guestsTable.id),
  xrpAddress: text("xrp_address").default(""),
  creditBalance: real("credit_balance").notNull().default(0),
  lifetimeEarned: real("lifetime_earned").notNull().default(0),
  bonusClaimed: boolean("bonus_claimed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const xrpTransactionsTable = pgTable("xrp_transactions", {
  id: serial("id").primaryKey(),
  fromGuestId: integer("from_guest_id").references(() => guestsTable.id),
  toGuestId: integer("to_guest_id").references(() => guestsTable.id),
  amount: real("amount").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("completed"),
  txHash: text("tx_hash").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertXrpAccountSchema = createInsertSchema(xrpAccountsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertXrpAccount = z.infer<typeof insertXrpAccountSchema>;
export type XrpAccount = typeof xrpAccountsTable.$inferSelect;

export const insertXrpTransactionSchema = createInsertSchema(xrpTransactionsTable).omit({ id: true, createdAt: true });
export type InsertXrpTransaction = z.infer<typeof insertXrpTransactionSchema>;
export type XrpTransaction = typeof xrpTransactionsTable.$inferSelect;

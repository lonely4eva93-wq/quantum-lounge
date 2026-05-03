import { pgTable, serial, text, real, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const treasuryAccountsTable = pgTable("treasury_accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'main' | 'operations' | 'payroll' | 'customer_payouts' | 'reserve'
  balance: real("balance").notNull().default(0),
  allocationPct: real("allocation_pct").notNull().default(0),
  walletAddress: text("wallet_address"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const treasuryTransactionsTable = pgTable("treasury_transactions", {
  id: serial("id").primaryKey(),
  fromAccountId: integer("from_account_id").references(() => treasuryAccountsTable.id),
  toAccountId: integer("to_account_id").references(() => treasuryAccountsTable.id),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // 'revenue_deposit' | 'allocation' | 'payroll_disbursement' | 'customer_payout' | 'operations_payment' | 'reserve_transfer' | 'withdrawal'
  description: text("description").notNull(),
  referenceId: integer("reference_id"),
  referenceType: text("reference_type"), // 'transaction' | 'employee' | 'guest'
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const employeesTable = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  walletAddress: text("wallet_address"),
  salary: real("salary").notNull(),
  payPeriod: text("pay_period").notNull().default("monthly"), // 'weekly' | 'biweekly' | 'monthly'
  totalPaid: real("total_paid").notNull().default(0),
  lastPaidAt: timestamp("last_paid_at"),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTreasuryAccountSchema = createInsertSchema(treasuryAccountsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTreasuryTransactionSchema = createInsertSchema(treasuryTransactionsTable).omit({ id: true, createdAt: true });
export const insertEmployeeSchema = createInsertSchema(employeesTable).omit({ id: true, createdAt: true, totalPaid: true, lastPaidAt: true });

export type TreasuryAccount = typeof treasuryAccountsTable.$inferSelect;
export type TreasuryTransaction = typeof treasuryTransactionsTable.$inferSelect;
export type Employee = typeof employeesTable.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

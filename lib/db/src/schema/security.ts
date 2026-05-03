import { pgTable, serial, text, boolean, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const securityEventTypeEnum = pgEnum("security_event_type", [
  "login_attempt",
  "login_success",
  "login_failure",
  "lockdown_activated",
  "lockdown_lifted",
  "suspicious_activity",
  "rate_limit_hit",
  "session_invalidated",
  "ip_auto_blocked",
  "ip_manual_blocked",
  "ip_unblocked",
  "path_scan_detected",
  "brute_force_detected",
]);

export const loginAttemptsTable = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  ip: text("ip").notNull(),
  success: boolean("success").notNull().default(false),
  userAgent: text("user_agent"),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
});

export const securityLogTable = pgTable("security_log", {
  id: serial("id").primaryKey(),
  eventType: securityEventTypeEnum("event_type").notNull(),
  ip: text("ip"),
  details: text("details"),
  severity: text("severity").notNull().default("info"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const systemStateTable = pgTable("system_state", {
  id: serial("id").primaryKey(),
  lockdownActive: boolean("lockdown_active").notNull().default(false),
  lockdownReason: text("lockdown_reason"),
  lockdownAt: timestamp("lockdown_at"),
  lockedBy: text("locked_by"),
  loginFailStreak: integer("login_fail_streak").notNull().default(0),
  lastFailAt: timestamp("last_fail_at"),
  totalSessions: integer("total_sessions").notNull().default(0),
  threatScanEnabled: boolean("threat_scan_enabled").notNull().default(true),
  autoBlockEnabled: boolean("auto_block_enabled").notNull().default(true),
  threatThreshold: real("threat_threshold").notNull().default(75),
});

export const blockedIpsTable = pgTable("blocked_ips", {
  id: serial("id").primaryKey(),
  ip: text("ip").notNull().unique(),
  reason: text("reason").notNull(),
  severity: text("severity").notNull().default("high"),
  autoBlocked: boolean("auto_blocked").notNull().default(false),
  threatScore: real("threat_score").notNull().default(0),
  blockedAt: timestamp("blocked_at").notNull().defaultNow(),
  unblockedAt: timestamp("unblocked_at"),
  active: boolean("active").notNull().default(true),
  blockCount: integer("block_count").notNull().default(1),
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
  country: text("country"),
  userAgent: text("user_agent"),
});

export const ipThreatSignalsTable = pgTable("ip_threat_signals", {
  id: serial("id").primaryKey(),
  ip: text("ip").notNull().unique(),
  failedLogins: integer("failed_logins").notNull().default(0),
  rateLimitHits: integer("rate_limit_hits").notNull().default(0),
  pathScanCount: integer("path_scan_count").notNull().default(0),
  totalRequests: integer("total_requests").notNull().default(0),
  errorCount: integer("error_count").notNull().default(0),
  threatScore: real("threat_score").notNull().default(0),
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
  firstSeen: timestamp("first_seen").notNull().defaultNow(),
  userAgent: text("user_agent"),
  flagged: boolean("flagged").notNull().default(false),
});

export const insertLoginAttemptSchema = createInsertSchema(loginAttemptsTable).omit({ id: true, attemptedAt: true });
export const insertSecurityLogSchema = createInsertSchema(securityLogTable).omit({ id: true, createdAt: true });
export const insertSystemStateSchema = createInsertSchema(systemStateTable).omit({ id: true });
export const insertBlockedIpSchema = createInsertSchema(blockedIpsTable).omit({ id: true, blockedAt: true });
export const insertThreatSignalSchema = createInsertSchema(ipThreatSignalsTable).omit({ id: true });

export type LoginAttempt = typeof loginAttemptsTable.$inferSelect;
export type SecurityLog = typeof securityLogTable.$inferSelect;
export type SystemState = typeof systemStateTable.$inferSelect;
export type BlockedIp = typeof blockedIpsTable.$inferSelect;
export type IpThreatSignal = typeof ipThreatSignalsTable.$inferSelect;

/**
 * Quantum Lounge Threat Engine
 * Tracks per-IP signals, calculates threat scores, auto-blocks hostile IPs.
 */

import { db, ipThreatSignalsTable, blockedIpsTable, securityLogTable, systemStateTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "./logger";

// ── Threat scoring weights ──────────────────────────────────────────────────
const WEIGHTS = {
  failedLogin: 20,       // Each failed login attempt
  rateLimitHit: 8,       // Each rate-limit trigger
  pathScan: 5,           // Each 404 on a non-asset path (scanning for endpoints)
  errorBurst: 3,         // Each 4xx/5xx error
  highVolume: 0.01,      // Per total request above 500
};

// Max scores
const MAX_SCORE = 100;
const AUTO_BLOCK_DEFAULT_THRESHOLD = 75;

// In-memory short-term signal buffer (flushed to DB every 30s)
interface SignalBuffer {
  failedLogins: number;
  rateLimitHits: number;
  pathScans: number;
  errors: number;
  requests: number;
  userAgent?: string;
  lastSeen: number;
}

const signalBuffer = new Map<string, SignalBuffer>();
let flushTimer: ReturnType<typeof setInterval> | null = null;

export function startThreatEngine() {
  if (flushTimer) return;
  flushTimer = setInterval(flushBufferToDb, 30_000);
  logger.info("Threat engine started");
}

export function stopThreatEngine() {
  if (flushTimer) clearInterval(flushTimer);
  flushTimer = null;
}

function getBuffer(ip: string): SignalBuffer {
  if (!signalBuffer.has(ip)) {
    signalBuffer.set(ip, { failedLogins: 0, rateLimitHits: 0, pathScans: 0, errors: 0, requests: 0, lastSeen: Date.now() });
  }
  return signalBuffer.get(ip)!;
}

export function recordRequest(ip: string, userAgent?: string) {
  const b = getBuffer(ip);
  b.requests++;
  b.lastSeen = Date.now();
  if (userAgent) b.userAgent = userAgent;
}

export function recordFailedLogin(ip: string) {
  const b = getBuffer(ip);
  b.failedLogins++;
  b.lastSeen = Date.now();
}

export function recordRateLimit(ip: string) {
  const b = getBuffer(ip);
  b.rateLimitHits++;
  b.lastSeen = Date.now();
}

export function recordPathScan(ip: string) {
  const b = getBuffer(ip);
  b.pathScans++;
  b.lastSeen = Date.now();
}

export function recordError(ip: string) {
  const b = getBuffer(ip);
  b.errors++;
  b.lastSeen = Date.now();
}

function computeThreatScore(signals: {
  failedLogins: number;
  rateLimitHits: number;
  pathScans: number;
  errors: number;
  totalRequests: number;
}): number {
  const raw =
    signals.failedLogins * WEIGHTS.failedLogin +
    signals.rateLimitHits * WEIGHTS.rateLimitHit +
    signals.pathScans * WEIGHTS.pathScan +
    signals.errors * WEIGHTS.errorBurst +
    Math.max(0, signals.totalRequests - 500) * WEIGHTS.highVolume;
  return Math.min(MAX_SCORE, raw);
}

// Blocked IP cache (refresh every 10s)
const blockedCache = new Map<string, number>(); // ip → expiry timestamp
const BLOCK_CACHE_TTL = 10_000;
let blockCacheRefreshed = 0;

async function refreshBlockCache() {
  const now = Date.now();
  if (now - blockCacheRefreshed < BLOCK_CACHE_TTL) return;
  blockCacheRefreshed = now;
  try {
    const rows = await db
      .select({ ip: blockedIpsTable.ip })
      .from(blockedIpsTable)
      .where(eq(blockedIpsTable.active, true));
    blockedCache.clear();
    for (const row of rows) {
      blockedCache.set(row.ip, now + BLOCK_CACHE_TTL);
    }
  } catch {
    // keep stale cache
  }
}

export async function isIpBlocked(ip: string): Promise<boolean> {
  await refreshBlockCache();
  return blockedCache.has(ip);
}

export function invalidateBlockCache() {
  blockCacheRefreshed = 0;
}

async function getAutoBlockThreshold(): Promise<number> {
  try {
    const [state] = await db.select({ t: systemStateTable.threatThreshold, enabled: systemStateTable.autoBlockEnabled })
      .from(systemStateTable).limit(1);
    if (!state?.enabled) return Infinity;
    return state?.t ?? AUTO_BLOCK_DEFAULT_THRESHOLD;
  } catch {
    return AUTO_BLOCK_DEFAULT_THRESHOLD;
  }
}

async function autoBlockIp(ip: string, score: number, reason: string, userAgent?: string) {
  try {
    // Upsert blocked_ips
    const existing = await db.select().from(blockedIpsTable).where(eq(blockedIpsTable.ip, ip)).limit(1);
    if (existing.length) {
      await db.update(blockedIpsTable).set({
        active: true, threatScore: score, reason,
        blockCount: existing[0].blockCount + 1, lastSeen: new Date(),
      }).where(eq(blockedIpsTable.ip, ip));
    } else {
      await db.insert(blockedIpsTable).values({
        ip, reason, severity: score >= 90 ? "critical" : "high",
        autoBlocked: true, threatScore: score, active: true, userAgent,
      });
    }

    await db.insert(securityLogTable).values({
      eventType: "ip_auto_blocked",
      ip,
      details: `Threat score ${score.toFixed(1)}/100 — ${reason}`,
      severity: score >= 90 ? "critical" : "high",
    });

    invalidateBlockCache();
    logger.warn({ ip, score, reason }, "IP auto-blocked by threat engine");
  } catch (err) {
    logger.error({ err, ip }, "Failed to auto-block IP");
  }
}

async function flushBufferToDb() {
  if (signalBuffer.size === 0) return;
  const threshold = await getAutoBlockThreshold();
  const entries = [...signalBuffer.entries()];
  signalBuffer.clear();

  for (const [ip, buf] of entries) {
    try {
      // Upsert ip_threat_signals
      const existing = await db.select().from(ipThreatSignalsTable)
        .where(eq(ipThreatSignalsTable.ip, ip)).limit(1);

      let cumulative = {
        failedLogins: buf.failedLogins,
        rateLimitHits: buf.rateLimitHits,
        pathScanCount: buf.pathScans,
        errorCount: buf.errors,
        totalRequests: buf.requests,
      };

      if (existing.length) {
        cumulative = {
          failedLogins: existing[0].failedLogins + buf.failedLogins,
          rateLimitHits: existing[0].rateLimitHits + buf.rateLimitHits,
          pathScanCount: existing[0].pathScanCount + buf.pathScans,
          errorCount: existing[0].errorCount + buf.errors,
          totalRequests: existing[0].totalRequests + buf.requests,
        };
      }

      const score = computeThreatScore({
        failedLogins: cumulative.failedLogins,
        rateLimitHits: cumulative.rateLimitHits,
        pathScans: cumulative.pathScanCount,
        errors: cumulative.errorCount,
        totalRequests: cumulative.totalRequests,
      });

      const flagged = score >= threshold * 0.6; // flag at 60% of block threshold

      if (existing.length) {
        await db.update(ipThreatSignalsTable).set({
          ...cumulative, threatScore: score, flagged,
          lastSeen: new Date(), userAgent: buf.userAgent ?? existing[0].userAgent,
        }).where(eq(ipThreatSignalsTable.ip, ip));
      } else {
        await db.insert(ipThreatSignalsTable).values({
          ip, ...cumulative, threatScore: score, flagged,
          userAgent: buf.userAgent, firstSeen: new Date(), lastSeen: new Date(),
        });
      }

      // Auto-block if threshold exceeded
      if (score >= threshold) {
        const alreadyBlocked = await isIpBlocked(ip);
        if (!alreadyBlocked) {
          const reasons: string[] = [];
          if (cumulative.failedLogins >= 3) reasons.push(`${cumulative.failedLogins} failed logins`);
          if (cumulative.rateLimitHits >= 5) reasons.push(`${cumulative.rateLimitHits} rate-limit hits`);
          if (cumulative.pathScanCount >= 10) reasons.push(`endpoint scanning (${cumulative.pathScanCount} probes)`);
          if (cumulative.errorCount >= 20) reasons.push(`error burst (${cumulative.errorCount} errors)`);
          await autoBlockIp(ip, score, reasons.join(", ") || "Threat threshold exceeded", buf.userAgent);
        }
      }
    } catch (err) {
      logger.error({ err, ip }, "Threat flush error");
    }
  }
}

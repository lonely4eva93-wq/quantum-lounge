import { Router } from "express";
import {
  db, loginAttemptsTable, securityLogTable, systemStateTable,
  blockedIpsTable, ipThreatSignalsTable,
} from "@workspace/db";
import { desc, gte, eq, sql, and } from "drizzle-orm";
import { invalidateLockdownCache } from "../middleware/security";
import { invalidateBlockCache } from "../lib/threat-engine";

const router = Router();

function requireOwner(req: any, res: any, next: any) {
  if (!req.session?.isOwner) return res.status(401).json({ error: "Unauthorized" });
  return next();
}

// ── GET /security/status — public (lockdown banner check) ─────────────────
router.get("/status", async (req, res) => {
  try {
    const [state] = await db.select().from(systemStateTable).limit(1);
    return res.json({
      lockdownActive: state?.lockdownActive ?? false,
      lockdownReason: state?.lockdownReason ?? null,
      lockdownAt: state?.lockdownAt ?? null,
    });
  } catch {
    return res.json({ lockdownActive: false, lockdownReason: null, lockdownAt: null });
  }
});

// ── GET /security/dashboard — full stats ──────────────────────────────────
router.get("/dashboard", requireOwner, async (req, res) => {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [attempts, recentLogs, state, failCount, blockedIps, topThreats] = await Promise.all([
    db.select().from(loginAttemptsTable)
      .where(gte(loginAttemptsTable.attemptedAt, since24h))
      .orderBy(desc(loginAttemptsTable.attemptedAt))
      .limit(50),

    db.select().from(securityLogTable)
      .orderBy(desc(securityLogTable.createdAt))
      .limit(100),

    db.select().from(systemStateTable).limit(1),

    db.select({ count: sql<number>`count(*)` }).from(loginAttemptsTable)
      .where(sql`${loginAttemptsTable.success} = false AND ${loginAttemptsTable.attemptedAt} >= ${since24h}`),

    db.select().from(blockedIpsTable)
      .where(eq(blockedIpsTable.active, true))
      .orderBy(desc(blockedIpsTable.blockedAt))
      .limit(50),

    db.select().from(ipThreatSignalsTable)
      .where(eq(ipThreatSignalsTable.flagged, true))
      .orderBy(desc(ipThreatSignalsTable.threatScore))
      .limit(20),
  ]);

  const successCount = attempts.filter((a) => a.success).length;
  const uniqueSuspiciousIps = new Set(
    attempts.filter((a) => !a.success).map((a) => a.ip)
  ).size;

  return res.json({
    state: state[0] ?? {
      lockdownActive: false, loginFailStreak: 0,
      threatScanEnabled: true, autoBlockEnabled: true, threatThreshold: 75,
    },
    stats: {
      totalAttempts24h: attempts.length,
      successfulLogins24h: successCount,
      failedLogins24h: Number(failCount[0]?.count ?? 0),
      uniqueSuspiciousIps,
      activeBlocks: blockedIps.length,
      flaggedIps: topThreats.length,
    },
    recentAttempts: attempts,
    recentLogs,
    blockedIps,
    topThreats,
  });
});

// ── POST /security/lockdown — kill switch ────────────────────────────────
router.post("/lockdown", requireOwner, async (req, res) => {
  const { reason, password } = req.body;
  if (password !== (process.env.OWNER_PASSWORD ?? "quantum2024")) {
    return res.status(401).json({ error: "Password confirmation required for lockdown." });
  }

  const ip = req.ip ?? "unknown";
  const now = new Date();

  await db.transaction(async (tx) => {
    const existing = await tx.select().from(systemStateTable).limit(1);
    if (existing.length) {
      await tx.update(systemStateTable).set({
        lockdownActive: true,
        lockdownReason: reason ?? "Manual lockdown",
        lockdownAt: now,
        lockedBy: ip,
      }).where(eq(systemStateTable.id, existing[0].id));
    } else {
      await tx.insert(systemStateTable).values({
        lockdownActive: true,
        lockdownReason: reason ?? "Manual lockdown",
        lockdownAt: now,
        lockedBy: ip,
      });
    }
    await tx.insert(securityLogTable).values({
      eventType: "lockdown_activated", ip,
      details: reason ?? "Owner initiated lockdown",
      severity: "critical",
    });
  });

  invalidateLockdownCache();
  req.log?.warn({ ip, reason }, "QUANTUM LOCKDOWN ACTIVATED");
  return res.json({ success: true, message: "Quantum lockdown activated. All public access blocked." });
});

// ── POST /security/unlock — lift lockdown using DISARM_CODE ──────────────
router.post("/unlock", async (req, res) => {
  const { password } = req.body;
  const DISARM_CODE = process.env.DISARM_CODE;
  if (!DISARM_CODE || password !== DISARM_CODE) {
    return res.status(401).json({ error: "Invalid disarm code." });
  }

  const ip = req.ip ?? "unknown";
  await db.transaction(async (tx) => {
    const existing = await tx.select().from(systemStateTable).limit(1);
    if (existing.length) {
      await tx.update(systemStateTable).set({
        lockdownActive: false, lockdownReason: null, lockdownAt: null,
      }).where(eq(systemStateTable.id, existing[0].id));
    }
    await tx.insert(securityLogTable).values({
      eventType: "lockdown_lifted", ip,
      details: "Lockdown lifted by owner",
      severity: "info",
    });
  });

  invalidateLockdownCache();
  return res.json({ success: true, message: "Lockdown lifted. System restored." });
});

// ── POST /security/block-ip — manual IP block ────────────────────────────
router.post("/block-ip", requireOwner, async (req, res) => {
  const { ip, reason } = req.body;
  if (!ip) return res.status(400).json({ error: "IP required" });

  const existing = await db.select().from(blockedIpsTable).where(eq(blockedIpsTable.ip, ip)).limit(1);
  if (existing.length) {
    await db.update(blockedIpsTable).set({ active: true, reason: reason ?? existing[0].reason })
      .where(eq(blockedIpsTable.ip, ip));
  } else {
    await db.insert(blockedIpsTable).values({
      ip, reason: reason ?? "Manual block by owner",
      severity: "high", autoBlocked: false, threatScore: 100, active: true,
    });
  }

  await db.insert(securityLogTable).values({
    eventType: "ip_manual_blocked",
    ip, details: reason ?? "Manual block by owner",
    severity: "high",
  });

  invalidateBlockCache();
  return res.json({ success: true, message: `IP ${ip} blocked.` });
});

// ── POST /security/unblock-ip ─────────────────────────────────────────────
router.post("/unblock-ip", requireOwner, async (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: "IP required" });

  await db.update(blockedIpsTable).set({ active: false, unblockedAt: new Date() })
    .where(eq(blockedIpsTable.ip, ip));

  await db.insert(securityLogTable).values({
    eventType: "ip_unblocked", ip,
    details: "Unblocked by owner",
    severity: "info",
  });

  invalidateBlockCache();
  return res.json({ success: true, message: `IP ${ip} unblocked.` });
});

// ── POST /security/scan — trigger a full threat sweep ───────────────────
router.post("/scan", requireOwner, async (req, res) => {
  const [state] = await db.select().from(systemStateTable).limit(1);
  const threshold = state?.threatThreshold ?? 75;

  // Find flagged IPs that aren't already blocked
  const threats = await db.select().from(ipThreatSignalsTable)
    .where(eq(ipThreatSignalsTable.flagged, true))
    .orderBy(desc(ipThreatSignalsTable.threatScore));

  const autoBlocked: string[] = [];

  for (const t of threats) {
    if (t.threatScore >= threshold) {
      const alreadyBlocked = await db.select().from(blockedIpsTable)
        .where(and(eq(blockedIpsTable.ip, t.ip), eq(blockedIpsTable.active, true)))
        .limit(1);

      if (!alreadyBlocked.length) {
        const reasons: string[] = [];
        if (t.failedLogins >= 3) reasons.push(`${t.failedLogins} failed logins`);
        if (t.rateLimitHits >= 5) reasons.push(`${t.rateLimitHits} rate-limit hits`);
        if (t.pathScanCount >= 10) reasons.push(`endpoint scanning (${t.pathScanCount} probes)`);
        if (t.errorCount >= 20) reasons.push(`error burst (${t.errorCount} errors)`);

        await db.insert(blockedIpsTable).values({
          ip: t.ip,
          reason: reasons.join(", ") || "Threat scan: threshold exceeded",
          severity: t.threatScore >= 90 ? "critical" : "high",
          autoBlocked: true,
          threatScore: t.threatScore,
          active: true,
          userAgent: t.userAgent,
        }).onConflictDoUpdate({
          target: blockedIpsTable.ip,
          set: { active: true, threatScore: t.threatScore },
        });

        await db.insert(securityLogTable).values({
          eventType: "ip_auto_blocked",
          ip: t.ip,
          details: `Threat scan — score ${t.threatScore.toFixed(1)}/100`,
          severity: t.threatScore >= 90 ? "critical" : "high",
        });

        autoBlocked.push(t.ip);
      }
    }
  }

  invalidateBlockCache();

  await db.insert(securityLogTable).values({
    eventType: "suspicious_activity",
    details: `Threat sweep completed. ${threats.length} flagged IPs found. ${autoBlocked.length} auto-blocked.`,
    severity: autoBlocked.length > 0 ? "high" : "info",
  });

  return res.json({
    success: true,
    scanned: threats.length,
    autoBlocked: autoBlocked.length,
    blockedIps: autoBlocked,
    message: `Sweep complete. ${threats.length} threats found, ${autoBlocked.length} IPs blocked.`,
  });
});

// ── PATCH /security/settings — update auto-block threshold / toggles ─────
router.patch("/settings", requireOwner, async (req, res) => {
  const { threatThreshold, autoBlockEnabled, threatScanEnabled } = req.body;

  const existing = await db.select().from(systemStateTable).limit(1);
  if (existing.length) {
    await db.update(systemStateTable).set({
      ...(threatThreshold != null && { threatThreshold }),
      ...(autoBlockEnabled != null && { autoBlockEnabled }),
      ...(threatScanEnabled != null && { threatScanEnabled }),
    }).where(eq(systemStateTable.id, existing[0].id));
  } else {
    await db.insert(systemStateTable).values({
      threatThreshold: threatThreshold ?? 75,
      autoBlockEnabled: autoBlockEnabled ?? true,
      threatScanEnabled: threatScanEnabled ?? true,
    });
  }

  return res.json({ success: true });
});

// ── POST /security/clear-sessions ────────────────────────────────────────
router.post("/clear-sessions", requireOwner, async (req, res) => {
  await db.insert(securityLogTable).values({
    eventType: "session_invalidated",
    ip: req.ip ?? "unknown",
    details: "All sessions cleared by owner",
    severity: "high",
  });
  return res.json({ success: true, message: "Session invalidation logged. Restart server to force all sessions to expire." });
});

export default router;

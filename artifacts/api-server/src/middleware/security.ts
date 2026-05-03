import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { db, systemStateTable, securityLogTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isIpBlocked, recordRequest, recordRateLimit, recordPathScan, recordError } from "../lib/threat-engine";

// ── Rate limiters ──────────────────────────────────────────────────────────

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — quantum field overloaded." },
  handler(req: Request, res: Response, _next: NextFunction, options: any) {
    const ip = getIp(req);
    req.log?.warn({ ip }, "Global rate limit hit");
    recordRateLimit(ip);
    res.status(429).json(options.message);
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts — cooling down." },
  handler(req: Request, res: Response, _next: NextFunction, options: any) {
    const ip = getIp(req);
    req.log?.warn({ ip }, "Auth rate limit hit");
    recordRateLimit(ip);
    res.status(429).json(options.message);
  },
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "API rate limit reached." },
});

// ── Helpers ────────────────────────────────────────────────────────────────

function getIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.socket?.remoteAddress ??
    "unknown"
  );
}

// ── IP block enforcement ───────────────────────────────────────────────────

export async function ipBlockGuard(req: Request, res: Response, next: NextFunction) {
  const ip = getIp(req);
  const path = req.path;

  // Unlock route always passes through
  if (path.startsWith("/api/security/unlock") || path === "/api/healthz") {
    return next();
  }

  const blocked = await isIpBlocked(ip);
  if (blocked) {
    req.log?.warn({ ip }, "Blocked IP attempted access");
    return res.status(403).json({
      error: "ACCESS DENIED",
      reason: "Your IP has been flagged and blocked by the Quantum Shield.",
      code: "IP_BLOCKED",
    });
  }

  return next();
}

// ── Request signal tracking ────────────────────────────────────────────────

export function signalTracker(req: Request, res: Response, next: NextFunction) {
  const ip = getIp(req);
  const ua = req.headers["user-agent"];

  // Track every request
  recordRequest(ip, ua);

  // After response, check for anomalies
  res.on("finish", () => {
    const status = res.statusCode;

    // 4xx scan detection (excluding 401/403 on auth routes)
    if (status === 404) {
      const p = req.path ?? "";
      // Only flag non-static 404s as scanning
      if (!p.match(/\.(js|css|png|ico|svg|woff|map)$/)) {
        recordPathScan(ip);
      }
    } else if (status >= 400 && status !== 401 && status !== 403 && status !== 429) {
      recordError(ip);
    }
  });

  return next();
}

// ── Lockdown middleware ────────────────────────────────────────────────────

let lockdownCache: { active: boolean; reason: string | null; checkedAt: number } = {
  active: false,
  reason: null,
  checkedAt: 0,
};

const LOCKDOWN_CACHE_TTL = 5000;

export async function lockdownGuard(req: Request, res: Response, next: NextFunction) {
  const path = req.path;
  if (
    path.startsWith("/api/auth") ||
    path.startsWith("/api/security/status") ||
    path.startsWith("/api/security/unlock") ||
    path === "/api/healthz"
  ) {
    return next();
  }

  const now = Date.now();
  if (now - lockdownCache.checkedAt > LOCKDOWN_CACHE_TTL) {
    try {
      const [state] = await db.select().from(systemStateTable).limit(1);
      lockdownCache = {
        active: state?.lockdownActive ?? false,
        reason: state?.lockdownReason ?? null,
        checkedAt: now,
      };
    } catch {
      return next();
    }
  }

  if (lockdownCache.active) {
    return res.status(503).json({
      error: "QUANTUM LOCKDOWN ACTIVE",
      reason: lockdownCache.reason ?? "System secured by owner.",
      code: "LOCKDOWN",
    });
  }

  return next();
}

export function invalidateLockdownCache() {
  lockdownCache.checkedAt = 0;
}

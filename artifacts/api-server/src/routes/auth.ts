import { Router } from "express";
import { db, settingsTable, loginAttemptsTable, securityLogTable } from "@workspace/db";
import { recordFailedLogin } from "../lib/threat-engine";

const router = Router();
const OWNER_PASSWORD = process.env.OWNER_PASSWORD ?? "quantum2024";

router.post("/login", async (req, res) => {
  const { password } = req.body;
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    ?? req.socket?.remoteAddress
    ?? "unknown";
  const ua = req.headers["user-agent"] ?? null;

  if (!password || password !== OWNER_PASSWORD) {
    // Log failed attempt to DB + threat engine
    await db.insert(loginAttemptsTable).values({ ip, success: false, userAgent: ua }).catch(() => {});
    await db.insert(securityLogTable).values({
      eventType: "login_failure", ip,
      details: "Invalid owner password",
      severity: "high",
    }).catch(() => {});
    recordFailedLogin(ip);

    return res.status(401).json({ error: "Invalid password" });
  }

  // Log success
  await db.insert(loginAttemptsTable).values({ ip, success: true, userAgent: ua }).catch(() => {});
  await db.insert(securityLogTable).values({
    eventType: "login_success", ip,
    details: "Owner logged in",
    severity: "info",
  }).catch(() => {});

  req.session.isOwner = true;
  const settings = await db.select().from(settingsTable).limit(1);
  const loungeName = settings[0]?.loungeName ?? "Quantum Lounge";
  return res.json({ isOwner: true, loungeName });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {});
  return res.json({ isOwner: false, loungeName: null });
});

router.get("/me", async (req, res) => {
  if (!req.session.isOwner) {
    return res.json({ isOwner: false, loungeName: null });
  }
  const settings = await db.select().from(settingsTable).limit(1);
  const loungeName = settings[0]?.loungeName ?? "Quantum Lounge";
  return res.json({ isOwner: true, loungeName });
});

export default router;

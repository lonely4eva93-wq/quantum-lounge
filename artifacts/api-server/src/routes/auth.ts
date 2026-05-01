import { Router } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const OWNER_PASSWORD = process.env.OWNER_PASSWORD ?? "quantum2024";

router.post("/login", async (req, res) => {
  const { password } = req.body;
  if (!password || password !== OWNER_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }
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

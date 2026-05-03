import { Router } from "express";
import { db, guestAchievementsTable, guestsTable, BADGES } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/guest/:guestId", async (req, res) => {
  const guestId = parseInt(req.params.guestId);
  if (isNaN(guestId)) return res.status(400).json({ error: "Invalid guest ID" });

  const rows = await db.select().from(guestAchievementsTable).where(eq(guestAchievementsTable.guestId, guestId));
  const earned = rows.map((r) => {
    const badge = BADGES.find((b) => b.id === r.badgeId);
    return { ...r, badge };
  });
  return res.json(earned);
});

router.post("/award", async (req, res) => {
  const { guestId, badgeId } = req.body as { guestId: number; badgeId: string };
  if (!guestId || !badgeId) return res.status(400).json({ error: "guestId and badgeId required" });

  const existing = await db.select().from(guestAchievementsTable)
    .where(and(eq(guestAchievementsTable.guestId, guestId), eq(guestAchievementsTable.badgeId, badgeId)));
  if (existing.length > 0) return res.json(existing[0]);

  const [row] = await db.insert(guestAchievementsTable).values({ guestId, badgeId }).returning();
  return res.json(row);
});

router.get("/badges", async (_req, res) => {
  return res.json(BADGES);
});

export default router;

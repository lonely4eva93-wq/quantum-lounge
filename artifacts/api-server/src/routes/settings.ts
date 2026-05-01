import { Router } from "express";
import { db, settingsTable } from "@workspace/db";

const router = Router();

async function getOrCreateSettings() {
  const existing = await db.select().from(settingsTable).limit(1);
  if (existing[0]) return existing[0];
  const [created] = await db.insert(settingsTable).values({}).returning();
  return created;
}

router.get("/", async (_req, res) => {
  return res.json(await getOrCreateSettings());
});

router.put("/", async (req, res) => {
  const { loungeName, tagline, houseFee, ownerName, theme, isOpen } = req.body;
  const current = await getOrCreateSettings();
  const updates: Partial<typeof settingsTable.$inferInsert> = {};
  if (loungeName !== undefined) updates.loungeName = loungeName;
  if (tagline !== undefined) updates.tagline = tagline;
  if (houseFee !== undefined) updates.houseFee = houseFee;
  if (ownerName !== undefined) updates.ownerName = ownerName;
  if (theme !== undefined) updates.theme = theme;
  if (isOpen !== undefined) updates.isOpen = isOpen;
  const [updated] = await db.update(settingsTable).set(updates).returning();
  return res.json(updated ?? current);
});

export default router;

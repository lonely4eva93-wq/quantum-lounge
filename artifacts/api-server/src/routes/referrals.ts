import { Router } from "express";
import { db, referralCodesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

router.get("/codes", async (_req, res) => {
  const rows = await db.select().from(referralCodesTable).orderBy(referralCodesTable.createdAt);
  return res.json(rows);
});

router.post("/codes", async (req, res) => {
  const { ownerGuestName, discountAmount, rewardAmount, maxUses } = req.body;
  const code = ownerGuestName.toUpperCase().slice(0, 4) + "-" + crypto.randomBytes(3).toString("hex").toUpperCase();

  const [row] = await db.insert(referralCodesTable).values({
    code, ownerGuestName, discountAmount, rewardAmount,
    maxUses: maxUses ?? null,
    isActive: true, usesCount: 0,
  }).returning();

  return res.status(201).json(row);
});

router.post("/apply", async (req, res) => {
  const { code, guestName } = req.body;
  const [ref] = await db.select().from(referralCodesTable).where(eq(referralCodesTable.code, code));

  if (!ref || !ref.isActive) {
    return res.status(404).json({ error: "Invalid or inactive referral code" });
  }
  if (ref.maxUses !== null && ref.usesCount >= ref.maxUses) {
    return res.status(400).json({ error: "Code has reached its maximum uses" });
  }

  await db.update(referralCodesTable)
    .set({ usesCount: ref.usesCount + 1 })
    .where(eq(referralCodesTable.id, ref.id));

  const updated = { ...ref, usesCount: ref.usesCount + 1 };

  return res.json({
    success: true,
    discount: ref.discountAmount,
    message: `Code applied! ${guestName} gets $${ref.discountAmount} off. ${ref.ownerGuestName} earns $${ref.rewardAmount} reward.`,
    code: updated,
  });
});

export default router;

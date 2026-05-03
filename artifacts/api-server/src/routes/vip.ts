import { Router } from "express";
import { db } from "@workspace/db";
import { vipMembershipsTable } from "@workspace/db";
import { transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const VIP_TIERS: Record<string, { price: number; perks: string }> = {
  silver: { price: 9.99, perks: "Silver badge, priority check-in, 10% fee discount" },
  gold: { price: 19.99, perks: "Gold badge, reserved room access, 20% fee discount, Oracle reading monthly" },
  cosmic: { price: 29.99, perks: "Cosmic badge, private room access, 50% fee discount, unlimited Oracle readings, permanent top-10 boost" },
};

router.get("/", async (_req, res) => {
  const rows = await db.select().from(vipMembershipsTable).orderBy(vipMembershipsTable.createdAt);
  return res.json(rows);
});

router.get("/:id", async (req, res) => {
  const [row] = await db.select().from(vipMembershipsTable).where(eq(vipMembershipsTable.id, Number(req.params.id)));
  if (!row) return res.status(404).json({ error: "Membership not found" });
  return res.json(row);
});

router.post("/", async (req, res) => {
  const { guestName, email, tier } = req.body;
  const tierConfig = VIP_TIERS[tier] ?? VIP_TIERS.silver;
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const [row] = await db.insert(vipMembershipsTable).values({
    guestName, email, tier,
    pricePerMonth: tierConfig.price,
    perks: tierConfig.perks,
    status: "active",
    expiresAt,
  }).returning();

  await db.insert(transactionsTable).values({
    type: "house_fee",
    amount: tierConfig.price,
    description: `VIP ${tier} membership — ${guestName}`,
    status: "completed",
  });

  return res.status(201).json(row);
});

router.put("/:id", async (req, res) => {
  const { status } = req.body;
  const [row] = await db.update(vipMembershipsTable)
    .set({ status })
    .where(eq(vipMembershipsTable.id, Number(req.params.id)))
    .returning();
  if (!row) return res.status(404).json({ error: "Membership not found" });
  return res.json(row);
});

router.delete("/:id", async (req, res) => {
  await db.update(vipMembershipsTable)
    .set({ status: "cancelled" })
    .where(eq(vipMembershipsTable.id, Number(req.params.id)));
  return res.status(204).send();
});

export default router;

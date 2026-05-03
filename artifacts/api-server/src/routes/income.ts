import { Router } from "express";
import { db, transactionsTable, vipMembershipsTable, sponsoredRoomsTable, leaderboardBoostsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

router.get("/summary", async (_req, res) => {
  const all = await db.select().from(transactionsTable);

  const sum = (filter: (t: typeof all[0]) => boolean) =>
    parseFloat(all.filter(filter).reduce((s, t) => s + (t.amount > 0 ? t.amount : 0), 0).toFixed(2));

  const houseFeeRevenue = sum(t => t.type === "house_fee" && t.description.includes("House fee"));
  const rentalRevenue = sum(t => t.type === "house_fee" && t.description.includes("rental"));
  const vipRevenue = sum(t => t.type === "house_fee" && t.description.includes("VIP"));
  const sponsorRevenue = sum(t => t.type === "house_fee" && t.description.includes("sponsorship"));
  const tipRevenue = sum(t => t.type === "house_fee" && t.description.includes("Tip"));
  const oracleRevenue = sum(t => t.type === "energy_upgrade" && t.description.includes("Oracle"));
  const premiumMessageRevenue = sum(t => t.type === "energy_upgrade" && t.description.includes("Premium DM"));
  const boostRevenue = sum(t => t.type === "energy_upgrade" && t.description.includes("boost"));
  const energyUpgradeRevenue = sum(t => t.type === "energy_upgrade" && t.description.includes("upgrade for"));

  const totalRevenue = parseFloat(
    (houseFeeRevenue + rentalRevenue + vipRevenue + sponsorRevenue + tipRevenue +
     oracleRevenue + premiumMessageRevenue + boostRevenue + energyUpgradeRevenue).toFixed(2)
  );

  const [{ c: activeVipMembers }] = await db.select({ c: count() }).from(vipMembershipsTable).where(eq(vipMembershipsTable.status, "active"));
  const [{ c: activeSponsors }] = await db.select({ c: count() }).from(sponsoredRoomsTable).where(eq(sponsoredRoomsTable.status, "active"));
  const [{ c: activeBoosts }] = await db.select({ c: count() }).from(leaderboardBoostsTable).where(eq(leaderboardBoostsTable.isActive, true));

  return res.json({
    houseFeeRevenue, rentalRevenue, vipRevenue, sponsorRevenue, tipRevenue,
    oracleRevenue, premiumMessageRevenue, boostRevenue, energyUpgradeRevenue,
    totalRevenue,
    activeVipMembers: Number(activeVipMembers),
    activeSponsors: Number(activeSponsors),
    activeBoosts: Number(activeBoosts),
  });
});

export default router;

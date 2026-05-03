import { Router } from "express";
import { db, oracleReadingsTable, transactionsTable } from "@workspace/db";
import crypto from "crypto";

const router = Router();
const ORACLE_PRICE = 2.99;

const READINGS = {
  basic: [
    "Your signal is faint but rising. The universe has noticed your frequency and is beginning to attune.",
    "You stand at the threshold of a quantum shift. Stillness now creates momentum later.",
    "The entanglement you seek already exists — you are simply learning to perceive it.",
  ],
  charged: [
    "Your particles are accelerating. Something significant is converging in your field within 7 cycles.",
    "The interference pattern around you is clearing. What was static will soon become signal.",
    "You have achieved partial coherence. The next collapse will land exactly where you intend.",
  ],
  quantum: [
    "You exist in superposition — all outcomes are valid until observed. Choose your observer wisely.",
    "The non-locality of your consciousness allows you to be in multiple states simultaneously. Use this.",
    "Your wave function has expanded beyond local spacetime. What you influence, you may not see directly.",
  ],
  transcended: [
    "You have collapsed beyond the event horizon of ordinary perception. You are both the particle and the field.",
    "Time is not linear from your current vantage point. The reading you needed reached you before you asked.",
    "Entanglement at this level requires no proximity. You are already there.",
  ],
};

const FREQUENCIES: Record<string, number> = {
  basic: 396,
  charged: 528,
  quantum: 741,
  transcended: 963,
};

function generateReading(energyLevel: string, vibe: string): { reading: string; frequency: number } {
  const pool = READINGS[energyLevel as keyof typeof READINGS] ?? READINGS.basic;
  const base = pool[Math.floor(Math.random() * pool.length)];
  const vibeInsert = vibe ? ` Your vibe of "${vibe}" amplifies this truth.` : "";
  return {
    reading: base + vibeInsert,
    frequency: FREQUENCIES[energyLevel] ?? 528,
  };
}

router.get("/readings", async (_req, res) => {
  const rows = await db.select().from(oracleReadingsTable).orderBy(oracleReadingsTable.createdAt);
  return res.json(rows);
});

router.post("/readings", async (req, res) => {
  const { guestName, vibe, energyLevel } = req.body;
  const { reading, frequency } = generateReading(energyLevel, vibe);
  const cosmicSignature = "ORX-" + crypto.randomBytes(6).toString("hex").toUpperCase();

  const [row] = await db.insert(oracleReadingsTable).values({
    guestName, vibe, energyLevel, reading, frequency,
    cosmicSignature, price: ORACLE_PRICE,
  }).returning();

  await db.insert(transactionsTable).values({
    type: "energy_upgrade",
    amount: ORACLE_PRICE,
    description: `Quantum Oracle reading for ${guestName}`,
    status: "completed",
  });

  return res.status(201).json(row);
});

export default router;

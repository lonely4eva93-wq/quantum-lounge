# 🌌 Quantum Lounge

> **An immersive quantum-themed digital nightclub.** Frequency rooms. Teleportation. Cosmic oracle readings. 8 revenue streams. Built to vibe.

🔗 **[Enter the Void → Live App](https://0dd01955-a631-47fe-8406-9f3d00b2e79a-00-35qhcdw4ozthd.riker.replit.dev/)**

![Quantum Lounge](https://0dd01955-a631-47fe-8406-9f3d00b2e79a-00-35qhcdw4ozthd.riker.replit.dev/opengraph.png)

---

## What is this?

Quantum Lounge is a fully-featured social experience disguised as a nightclub. Guests materialize in the lobby, choose a frequency room, send quantum-encrypted messages, upgrade their energy level, and teleport between dimensions — all while the owner manages everything from a real-time dashboard.

It's a passion project built to be **actually useful**: every feature generates real revenue.

---

## ✨ Features

### For Guests
| Feature | Description |
|---|---|
| 🚪 **Check-in** | Materialize with an alias and vibe frequency |
| 🔊 **Frequency Rooms** | 528Hz healing, 432Hz cosmic drift, 963Hz portal zero — browse and inspect live |
| 📡 **Quantum Messages** | Send encrypted messages to the lounge feed |
| ⚡ **Energy Upgrades** | Level up from Charged → Quantum → Transcended |
| 🌀 **Teleportation** | Jump between rooms instantly |
| 👑 **VIP Membership** | Silver / Gold / Cosmic monthly tiers |
| 🔮 **Quantum Oracle** | Get a cosmic reading for $2.99 |
| 🚀 **Leaderboard Boosts** | Amplify your presence for $4.99/hr |
| 🔗 **Referral Codes** | Create invite links, earn rewards |
| 💌 **Premium DMs** | Encrypted quantum-signed direct messages |

### For the Owner
- Real-time revenue dashboard across all 8 income streams
- Guest management, room CRUD, transaction ledger
- VIP subscriptions, room rentals ($50/hr), tip tracking with house cut
- Sponsored room management, referral analytics, boost monitoring
- One-click cashout flow

---

## 💰 Revenue Streams

```
1. VIP Memberships    — $9.99 / $19.99 / $29.99 per month
2. Room Rentals       — $50/hr private bookings
3. Tipping            — Guest tips with 15% house cut
4. Quantum Oracle     — $2.99 per cosmic reading
5. Sponsored Rooms    — Brand sponsorships per room/month
6. Referral Codes     — Affiliate reward system
7. Premium Messages   — $0.99 per encrypted DM
8. Leaderboard Boosts — $4.99/hr position amplification
```

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS + Framer Motion |
| Backend | Express 5 + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| API | OpenAPI 3.1 → Orval codegen (React Query hooks + Zod schemas) |
| Monorepo | pnpm workspaces |
| Auth | express-session (owner password) |
| Animations | Framer Motion + custom GlitchText/FrequencyWaveform |

---

## 🚀 Running Locally

```bash
# Install dependencies
pnpm install

# Push DB schema
pnpm --filter @workspace/db run push

# Start everything
pnpm --filter @workspace/api-server run dev   # API on :8080
pnpm --filter @workspace/quantum-lounge run dev  # Frontend on :18896
```

**Owner login:** Visit `/owner` → password: `quantum2024` (set `OWNER_PASSWORD` env var to change)

---

## 📁 Project Structure

```
artifacts/
  quantum-lounge/     # React + Vite frontend
  api-server/         # Express 5 API
lib/
  db/                 # Drizzle ORM schema + migrations
  api-spec/           # OpenAPI spec + codegen
  api-client-react/   # Generated React Query hooks
  api-zod/            # Generated Zod schemas
```

---

## 🌐 Live Demo

👉 **[quantum-lounge.riker.replit.dev](https://0dd01955-a631-47fe-8406-9f3d00b2e79a-00-35qhcdw4ozthd.riker.replit.dev/)**

No sign-up. No cover charge. Just enter an alias and a vibe.

---

*Built with Replit Agent. Open to contributors — PRs welcome.*

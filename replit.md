# Quantum Lounge

## Ownership & Legal

**Inventor & Owner: William Brown**
All rights to the Quantum Lounge application, concept, codebase, brand, and all associated intellectual property are owned exclusively by William Brown. Any legal filings, patent applications, copyright registrations, terms of service, privacy policy, or commercial agreements related to this application must name William Brown as the sole owner and inventor.

- **App Name**: Quantum Lounge
- **Owner**: William Brown
- **Concept**: Immersive social quantum-themed digital nightclub
- **Copyright**: © William Brown. All rights reserved.

## Overview

An immersive social quantum lounge — a dark, neon-lit digital nightclub where guests check in, vibe in frequency-tuned rooms, send quantum-encrypted messages, upgrade their energy levels, and teleport between rooms. The owner logs in to manage everything and cash out revenue.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/quantum-lounge), Framer Motion, Tailwind CSS
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: express-session (owner password auth)
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec in lib/api-spec/openapi.yaml)
- **Build**: esbuild (CJS bundle)

## Owner Login

- Default password: `quantum2024`
- Set `OWNER_PASSWORD` env var to change it
- Visit `/owner` to log in

## Key Pages

### Public
- `/` — Lobby: guest check-in, live room display, send quantum messages
- `/rooms` — Browse all quantum frequency rooms
- `/messages` — Quantum-encrypted message feed
- `/teleport` — Teleport guests between rooms
- `/energy` — Energy upgrade marketplace
- `/vip` — VIP membership tiers (Silver $9.99, Gold $19.99, Cosmic $29.99/mo)
- `/oracle` — Quantum Oracle cosmic readings ($2.99 each)
- `/boost` — Leaderboard position boosts ($4.99/hr)
- `/referrals` — Create and apply referral codes
- `/premium-messages` — Encrypted premium DMs ($0.99 each)

### Owner
- `/owner` — Owner login (password: `quantum2024`)
- `/owner/dashboard` — Revenue stats, balance, cashout, income stream mini-grid
- `/owner/revenue` — Full income breakdown across all 8 revenue streams
- `/owner/guests` — Guest management
- `/owner/rooms` — Room CRUD
- `/owner/vip` — VIP membership management
- `/owner/rentals` — Room rental bookings ($50/hr)
- `/owner/tips` — Tip log with house cut tracking
- `/owner/sponsored` — Room sponsorship management
- `/owner/referrals` — Referral code management
- `/owner/boosts` — Leaderboard boost tracking
- `/owner/transactions` — Full transaction ledger
- `/owner/settings` — Lounge settings
- `/owner/security` — Security dashboard, IP threat management, kill switch

## Revenue Streams (8 total)

1. **VIP Memberships** — Monthly subscriptions (Silver/Gold/Cosmic)
2. **Room Rentals** — Private event bookings at $50/hr
3. **Tipping** — Guest-to-guest tips with 15% house cut
4. **Quantum Oracle** — Cosmic readings at $2.99 each
5. **Sponsored Rooms** — Brand sponsorships per room/month
6. **Referral Codes** — Guest referral rewards system
7. **Premium Messages** — Encrypted DMs at $0.99 each
8. **Leaderboard Boosts** — Position amplification at $4.99/hr

## Security System

- **Quantum Shield**: Active IP threat detection engine
- **Auto-blocking**: IPs exceeding threat threshold (default 75/100) are auto-blocked
- **Threat signals tracked**: failed logins, rate-limit hits, endpoint scanning (404s), error bursts
- **Kill switch**: Owner-password-confirmed full lockdown blocks all public API access
- **Security log**: All events logged to DB with severity levels
- **Rate limiting**: Global 200 req/min, auth 10 attempts/15min
- **Helmet.js**: Full HTTP security headers
- **Session hardening**: httpOnly, secure (prod), sameSite strict (prod), 8hr TTL
- Tables: `login_attempts`, `security_log`, `system_state`, `blocked_ips`, `ip_threat_signals`

## Database Schema

Tables: rooms, guests, messages, energy_upgrades, guest_upgrades, teleport_events, transactions, settings, vip_memberships, room_rentals, tips, oracle_readings, sponsored_rooms, referral_codes, premium_messages, leaderboard_boosts, guest_achievements, room_events, room_chat, login_attempts, security_log, system_state, blocked_ips, ip_threat_signals

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## GitHub

- Repository: https://github.com/lonely4eva93-wq/quantum-lounge
- Remote name: `github` (URL: https://github.com/lonely4eva93-wq/quantum-lounge.git, no credentials embedded)
- PAT stored as `GITHUB_PERSONAL_ACCESS_TOKEN` secret in Replit — must be set for sync to work
- **Automatic sync**: every task merge triggers `scripts/post-merge.sh`, which runs `scripts/github-sync.sh` to push `HEAD` to `github/main`. A git `post-commit` hook is also installed by `scripts/install-git-hooks.sh` so direct git commits also sync automatically.
- **Fresh clone / manual setup**: run `bash scripts/install-git-hooks.sh` once to install the post-commit hook; push manually via `bash scripts/github-sync.sh`
- Sync uses fetch + `--force-with-lease` (Replit is the source of truth); credentials are injected via a short-lived helper script, never via the remote URL

## Mobile App (Expo)

- Artifact: `artifacts/quantum-lounge-mobile` at preview path `/mobile`
- 5 tabs: Home (check-in), Rooms (browse + teleport), Ranks (leaderboard), Events, Profile (badges + share)
- Connects to same API server via `EXPO_PUBLIC_DOMAIN`
- iOS App Store publishing via Replit Expo Launch (click Publish)
- Android publishing NOT supported on Replit
- Bundle ID: `com.quantumlounge.app`
- Test on device: scan QR code from preview bar with Expo Go app

## Email Notifications

- Resend integration dismissed by user — no email integration active
- If user provides RESEND_API_KEY, store as secret and implement via Resend REST API directly

## Notes

- orval zod output uses mode: "single" (not "split") to avoid duplicate type exports
- lib/api-zod/src/index.ts only exports from ./generated/api (not ./generated/types)
- Session secret uses SESSION_SECRET env var
- DB tables added: guest_achievements, room_events, room_chat (beyond original 16 tables)
- WebSocket server runs on /api/ws path (ws package installed in api-server)

# Quantum Lounge

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

- `/` — Public lobby: guest check-in, live room display, send quantum messages
- `/rooms` — Browse all quantum frequency rooms
- `/messages` — Quantum-encrypted message feed
- `/teleport` — Teleport guests between rooms
- `/energy` — Energy upgrade marketplace
- `/owner` — Owner login
- `/owner/dashboard` — Revenue stats, balance, cashout
- `/owner/guests` — Guest management
- `/owner/rooms` — Room CRUD
- `/owner/transactions` — Full transaction ledger
- `/owner/settings` — Lounge settings (name, house fee, theme, open/close)

## Database Schema

Tables: rooms, guests, messages, energy_upgrades, guest_upgrades, teleport_events, transactions, settings

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Notes

- orval zod output uses mode: "single" (not "split") to avoid duplicate type exports
- lib/api-zod/src/index.ts only exports from ./generated/api (not ./generated/types)
- Session secret uses SESSION_SECRET env var

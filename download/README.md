# Daily Check-in Popup Card — Source Code

## Overview
A responsive popup card UI built with **Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui**. Recreates a crypto/web3 daily check-in rewards popup with wallet info, streak stats, claim button, and achievement badges.

## Quick Start

```bash
# 1. Install dependencies
bun install
# (or: npm install / pnpm install)

# 2. Start dev server
bun run dev
# (or: npm run dev / pnpm dev)

# 3. Open in browser
# http://localhost:3000
```

## Requirements
- Node.js 18+
- Bun (recommended) or npm/pnpm

## Main Files

| File | Description |
|------|-------------|
| `src/app/page.tsx` | **Main popup card component** — all UI logic lives here |
| `src/app/layout.tsx` | Root layout |
| `src/app/globals.css` | Tailwind + theme tokens |
| `src/components/ui/*` | shadcn/ui components (pre-installed) |
| `package.json` | Dependencies & scripts |

## Features
- Responsive (mobile + desktop)
- 1100px max-width centered card
- Wallet section (address, network, Select Network button)
- 4 stat cards (Current Streak, Highest Streak, Total Check-ins, Total ZP Earned)
- 3 reward cards (Today's, Next, Next Bonus)
- Claim button with status change (Claim available → Reward Claimed)
- Achievement badges grid (6 badges)
- No internal scrolling — page scrolls naturally on mobile, fits desktop viewport

## Customization
Edit `src/app/page.tsx` to change:
- `STATS` array — streak/check-in numbers
- `REWARDS` array — reward amounts
- `BADGES` array — achievement names & unlock status
- Colors are inline `style` props (search for `#8a2be2`, `#a876ff`, `#b8a2ff`)
- Wallet address: search for `0xA4F3`

## Tech Stack
- Next.js 16 (App Router)
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui (New York style)
- lucide-react (icons)
- Prisma ORM (available if needed)

## Build for Production
```bash
bun run build
bun run start
```

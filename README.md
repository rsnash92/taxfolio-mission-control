# TaxFolio Mission Control

Agent orchestration dashboard for TaxFolio's 7-agent AI system.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in your keys
cp .env.local.example .env.local

# 3. Run locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (server only) |
| `HEARTBEAT_SECRET` | Secret for VPS heartbeat auth |

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_KEY
vercel env add HEARTBEAT_SECRET
```

## Architecture

- `/src/app/page.tsx` — Dashboard (approvals, kanban, live feed)
- `/src/app/api/ops/heartbeat/` — VPS calls every 5 mins
- `/src/app/api/ops/proposals/` — Create/list proposals
- `/src/app/api/ops/missions/` — List missions with steps
- `/src/app/api/ops/approvals/` — Rob's approval queue
- `/src/lib/proposal-service.ts` — THE HUB (cap gates + auto-approve)
- `/src/lib/trigger-evaluator.ts` — Evaluates trigger rules
- `/src/lib/reaction-processor.ts` — Inter-agent reactions
- `/src/lib/stale-recovery.ts` — Recovers timed-out steps

## Agents

| Name | Role | Model |
|------|------|-------|
| Jarvis 👑 | Orchestrator | Sonnet 4.5 |
| Atlas 📊 | Strategy & Intel | Sonnet 4.5 |
| Sentinel 🔍 | HMRC Monitor | Haiku 4.5 |
| Quill ✍️ | Content & SEO | Sonnet 4.5 |
| Echo 📈 | Social & Lead Gen | Haiku 4.5 |
| Shield 🛡️ | Quality Assurance | Sonnet 4.5 |
| Forge 💻 | Developer | Sonnet 4.5 |

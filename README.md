# Credit card recommender

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/mojahed4es-projects/v0-which-card)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/vH2BgXsduCn)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/mojahed4es-projects/v0-which-card](https://vercel.com/mojahed4es-projects/v0-which-card)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/vH2BgXsduCn](https://v0.app/chat/vH2BgXsduCn)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

---

## Supabase Logging & Consent

### Overview

This app logs card calculation requests to Supabase for analytics and improvement purposes. **Logging is GDPR-compliant and requires user consent.**

### How Logging Works

1. **Frontend** (`lib/log-card-request.ts`): After computing the best card, the app calls `logCardRequest()` which:
   - Checks localStorage for consent status
   - Skips logging entirely if consent is "none" or not set
   - Sends data to `/api/log-card-request` if consent is "full"

2. **API Route** (`app/api/log-card-request/route.ts`): The server-side handler:
   - Reads consent from the `whichcard_consent` cookie (server-side source of truth)
   - Extracts IP, user_agent, referer, and location from request headers
   - Inserts data into the `card_requests` table using Supabase service role
   - Never throws errors to the client (fails silently)

3. **Supabase Client** (`lib/supabase/server.ts`): Creates a server-side Supabase client using the service role key to bypass RLS.

### What is Logged

**When consent is "full":**
- Purchase info: `amount_aed`, `category`, `channel`
- Best card: `best_card_id`, `best_card_name`, `best_card_effective_rate`, `best_card_reward_value_aed`
- All results: `all_results` (JSON array of all card calculations)
- Settings snapshot: `card_settings_snapshot` (user's card settings)
- Technical data: `ip`, `user_agent`, `referer`, `headers`
- Location: `location`, `country`, `region`, `city`, `latitude`, `longitude`

**When consent is "none" or not set:**
- Nothing is logged

### Consent Management

Consent is stored in:
- **Cookie**: `whichcard_consent` (for server-side access)
- **localStorage**: `whichcard_consent` (for client-side checks)

Users can manage their consent via:
- The initial consent banner (shown on first visit)
- The "Privacy & consent settings" link in the footer

### Database Setup

**Table:** `public.card_requests`

To add location tracking columns, run the SQL in `docs/supabase-card-logs-alter.sql`:

\`\`\`sql
ALTER TABLE public.card_requests
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS latitude text,
  ADD COLUMN IF NOT EXISTS longitude text;
\`\`\`

### Environment Variables

Logging requires these environment variables to be set:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server-side only, bypasses RLS) |

**Note:** If these env vars are not set, logging is silently skipped. This is intentional to allow local development without Supabase.

### Privacy Policy

You must maintain a privacy policy that discloses:
- What data is collected
- How it is used
- How users can exercise their rights (access, deletion, etc.)
- Contact information for privacy inquiries

This is required for GDPR compliance and good practice.

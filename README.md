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


## Local Development

### Prerequisites

- Node.js (v18 or higher)
- pnpm (package manager)
- A Supabase project (for database connection)

### Setup Instructions

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone <repository-url>
   cd which-credit-card
   ```

2. **Install pnpm** (if not already installed)
   ```bash
   npm install -g pnpm
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the root directory with your Supabase credentials:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   SUPABASE_SECRET_KEY=your_supabase_secret_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret
   
   # PostgreSQL Configuration (if needed)
   POSTGRES_HOST=your_postgres_host
   POSTGRES_DATABASE=postgres
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_URL=your_postgres_connection_string
   POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_connection_string
   POSTGRES_PRISMA_URL=your_postgres_prisma_connection_string
   
   # XAI API (if needed)
   XAI_API_KEY=your_xai_api_key
   ```
   
   You can find these values in your Supabase project settings:
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the required keys and URLs

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server (requires build first)
- `pnpm lint` - Run ESLint to check for code issues

### Troubleshooting

- **Port 3000 already in use**: Change the port by running `pnpm dev -- -p 3001`
- **Environment variables not loading**: Make sure your `.env` file is in the root directory and restart the dev server
- **Dependencies issues**: Try deleting `node_modules` and `pnpm-lock.yaml`, then run `pnpm install` again


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

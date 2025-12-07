/**
 * API Route: POST /api/log-card-request
 *
 * Logs card calculation requests to Supabase.
 *
 * This endpoint:
 * - Respects GDPR consent (reads from cookie)
 * - Captures IP, user_agent, referer, location from headers (when consent is "full")
 * - Uses Supabase service role to bypass RLS
 * - Never throws errors to the client
 *
 * Table: public.card_requests
 *
 * Supabase logging only works when these env vars are present:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { LogCardRequestPayload } from "@/lib/log-card-request"
import type { ConsentLevel } from "@/lib/consent"

const CONSENT_COOKIE_NAME = "whichcard_consent"

function parseConsentFromCookie(cookieHeader: string | null): ConsentLevel | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`${CONSENT_COOKIE_NAME}=([^;]+)`))
  if (!match) return null
  const value = decodeURIComponent(match[1])
  if (value === "full" || value === "none") return value
  return null
}

export async function POST(req: NextRequest) {
  try {
    // Parse consent from cookie (server-side source of truth)
    const cookieHeader = req.headers.get("cookie")
    const consent = parseConsentFromCookie(cookieHeader)

    // Skip logging if no consent or consent is "none"
    if (!consent || consent === "none") {
      return NextResponse.json({ ok: true, skipped: true, reason: "no_consent" })
    }

    // Parse request body
    const body = (await req.json()) as LogCardRequestPayload

    // Create Supabase client
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      console.warn("[v0] Supabase not configured, skipping log")
      return NextResponse.json({ ok: true, skipped: true, reason: "no_supabase" })
    }

    // Extract headers for logging
    const ipHeader =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-vercel-forwarded-for") ||
      null
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : null

    const userAgent = req.headers.get("user-agent") || null
    const referer = req.headers.get("referer") || null

    // Vercel geo headers (only available in production on Vercel)
    const country = req.headers.get("x-vercel-ip-country") || null
    const region = req.headers.get("x-vercel-ip-country-region") || null
    const city = req.headers.get("x-vercel-ip-city") || null
    const latitude = req.headers.get("x-vercel-ip-latitude") || null
    const longitude = req.headers.get("x-vercel-ip-longitude") || null

    // Build location string from geo data
    const locationParts = [city, region, country].filter(Boolean)
    const location = locationParts.length > 0 ? locationParts.join(", ") : null

    // Collect headers for debugging (exclude sensitive ones)
    const headersForLog: Record<string, string> = {}
    req.headers.forEach((value, key) => {
      const lower = key.toLowerCase()
      if (lower.includes("cookie") || lower.includes("authorization")) return
      headersForLog[key] = value
    })

    // Add geo coordinates to headers if available
    if (latitude && longitude) {
      headersForLog["_geo_latitude"] = latitude
      headersForLog["_geo_longitude"] = longitude
    }

    // Insert into Supabase
    const { error } = await supabase.from("card_requests").insert({
      // Purchase info
      amount_aed: body.purchase.amountAED,
      category: body.purchase.category,
      channel: body.purchase.channel,

      // Best card info
      best_card_id: body.bestCard?.cardId || null,
      best_card_name: body.bestCard?.cardName || null,
      best_card_effective_rate: body.bestCard?.effectiveRate || null,
      best_card_reward_value_aed: body.bestCard?.rewardValueAED || null,

      // Full results and settings snapshot
      all_results: body.results,
      card_settings_snapshot: body.settings,

      // Request metadata (only with full consent)
      user_agent: userAgent,
      ip,
      referer,
      location,
      headers: headersForLog,
    })

    if (error) {
      console.error("[v0] Supabase insert error:", error)
      return NextResponse.json({ ok: false, error: error.message })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Error in log-card-request:", error)
    return NextResponse.json({ ok: false, error: "Internal error" })
  }
}

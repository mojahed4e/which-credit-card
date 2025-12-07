/**
 * API Route: POST /api/log-card-request
 *
 * Logs card calculation requests to Supabase.
 *
 * This endpoint:
 * - Respects GDPR consent (reads from cookie)
 * - Captures IP, user_agent, referer, location from headers (when consent is "full")
 * - Captures precise GPS location from browser (when provided)
 * - Uses correct client IP (prefers cf-connecting-ip over Vercel proxied IPs)
 * - Uses Supabase service role to bypass RLS
 * - Never throws errors to the client
 *
 * Table: public.card_requests
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

    const cfConnectingIp = req.headers.get("cf-connecting-ip")
    const xForwardedFor = req.headers.get("x-forwarded-for")
    const xRealIp = req.headers.get("x-real-ip")
    const vercelForwardedFor = req.headers.get("x-vercel-forwarded-for")

    // Priority: cf-connecting-ip > x-forwarded-for (first IP) > x-real-ip > x-vercel-forwarded-for
    let ip: string | null = null
    if (cfConnectingIp) {
      ip = cfConnectingIp.trim()
    } else if (xForwardedFor) {
      ip = xForwardedFor.split(",")[0].trim()
    } else if (xRealIp) {
      ip = xRealIp.trim()
    } else if (vercelForwardedFor) {
      ip = vercelForwardedFor.split(",")[0].trim()
    }

    const userAgent = req.headers.get("user-agent") || null
    const referer = req.headers.get("referer") || null

    const cfIpCountry = req.headers.get("cf-ipcountry")
    const vercelIpCountry = req.headers.get("x-vercel-ip-country")
    const country = cfIpCountry || vercelIpCountry || null

    // Vercel geo headers (IP-based, less accurate)
    const region = req.headers.get("x-vercel-ip-country-region") || null
    const city = req.headers.get("x-vercel-ip-city") || null
    const ipLatitude = req.headers.get("x-vercel-ip-latitude") || null
    const ipLongitude = req.headers.get("x-vercel-ip-longitude") || null
    const timezone = req.headers.get("x-vercel-ip-timezone") || null
    const continent = req.headers.get("x-vercel-ip-continent") || null
    const asNumber = req.headers.get("x-vercel-ip-as-number") || null

    // Build location string from geo data
    const locationParts = [city, region, country].filter(Boolean)
    const location = locationParts.length > 0 ? locationParts.join(", ") : null

    // Collect headers for debugging (exclude sensitive ones)
    const headersForLog: Record<string, string> = {}
    req.headers.forEach((value, key) => {
      const lower = key.toLowerCase()
      // Skip sensitive headers
      if (
        lower.includes("cookie") ||
        lower.includes("authorization") ||
        lower.includes("oidc-token") ||
        lower.includes("signature")
      ) {
        return
      }
      headersForLog[key] = value
    })

    if (ipLatitude && ipLongitude) {
      headersForLog["_ip_geo_latitude"] = ipLatitude
      headersForLog["_ip_geo_longitude"] = ipLongitude
    }

    if (body.gpsLocation) {
      headersForLog["_gps_latitude"] = String(body.gpsLocation.latitude)
      headersForLog["_gps_longitude"] = String(body.gpsLocation.longitude)
      headersForLog["_gps_accuracy_meters"] = String(body.gpsLocation.accuracy)
      if (body.gpsLocation.altitude !== null) {
        headersForLog["_gps_altitude"] = String(body.gpsLocation.altitude)
      }
      if (body.gpsLocation.speed !== null) {
        headersForLog["_gps_speed"] = String(body.gpsLocation.speed)
      }
      if (body.gpsLocation.heading !== null) {
        headersForLog["_gps_heading"] = String(body.gpsLocation.heading)
      }
    }

    if (timezone) headersForLog["_ip_timezone"] = timezone
    if (continent) headersForLog["_ip_continent"] = continent
    if (asNumber) headersForLog["_ip_as_number"] = asNumber

    const finalLatitude = body.gpsLocation?.latitude ?? (ipLatitude ? Number.parseFloat(ipLatitude) : null)
    const finalLongitude = body.gpsLocation?.longitude ?? (ipLongitude ? Number.parseFloat(ipLongitude) : null)

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

      latitude: finalLatitude,
      longitude: finalLongitude,

      // All headers including geo data
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

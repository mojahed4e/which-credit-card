/**
 * API Route: POST /api/log-card-request
 *
 * Logs card calculation requests to Supabase. Hardened for public exposure:
 * - Validates the request body with a strict zod schema (rejects malformed JSON).
 * - Caps body size before parsing (rejects payload-stuffing attacks).
 * - Per-IP rate limit to slow down floods within a warm serverless instance.
 * - Trims the headers blob written to the DB.
 * - Returns generic error strings — never leaks Supabase/internal details.
 * - Reads consent from a server-side cookie (not the client-sent body).
 *
 * Table: public.card_requests
 */

import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { rateLimit } from "@/lib/rate-limit"
import type { ConsentLevel } from "@/lib/consent"

const CONSENT_COOKIE_NAME = "whichcard_consent"

// Limits — generous enough for real users but cheap to enforce.
const MAX_BODY_BYTES = 32 * 1024 // 32 KB
const MAX_HEADERS_BYTES = 4 * 1024 // 4 KB after serialization
const RATE_LIMIT_PER_MINUTE = 30 // per IP

const PURCHASE_SCHEMA = z.object({
  amountAED: z.number().finite().min(0).max(10_000_000),
  location: z.enum(["domestic", "international"]),
  channel: z.enum(["pos", "online", "wallet"]),
  category: z.string().max(64),
})

const CARD_RESULT_SCHEMA = z.object({
  cardId: z.string().max(64),
  cardName: z.string().max(128),
  rewardType: z.enum(["cashback", "points"]),
  rewardValueAED: z.number().finite(),
  rawPoints: z.number().finite().optional(),
  effectiveRate: z.number().finite(),
  note: z.string().max(512),
})

const GPS_SCHEMA = z.object({
  latitude: z.number().finite(),
  longitude: z.number().finite(),
  accuracy: z.number().finite().optional().default(0),
  altitude: z.number().finite().nullable().optional(),
  speed: z.number().finite().nullable().optional(),
  heading: z.number().finite().nullable().optional(),
})

const PAYLOAD_SCHEMA = z.object({
  purchase: PURCHASE_SCHEMA,
  bestCard: CARD_RESULT_SCHEMA.nullable(),
  results: z.array(CARD_RESULT_SCHEMA).max(32),
  // Free-shaped — we don't need to validate every card setting key, just keep size sane.
  settings: z.record(z.string(), z.unknown()),
  consent: z.enum(["full", "none"]),
  gpsLocation: GPS_SCHEMA.nullable().optional(),
})

function parseConsentFromCookie(cookieHeader: string | null): ConsentLevel | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`${CONSENT_COOKIE_NAME}=([^;]+)`))
  if (!match) return null
  const value = decodeURIComponent(match[1])
  if (value === "full" || value === "none") return value
  return null
}

function clientIpOf(req: NextRequest): string {
  // Priority: Cloudflare > x-forwarded-for (first hop) > x-real-ip > Vercel.
  const cf = req.headers.get("cf-connecting-ip")
  if (cf) return cf.trim()
  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  const xri = req.headers.get("x-real-ip")
  if (xri) return xri.trim()
  const vff = req.headers.get("x-vercel-forwarded-for")
  if (vff) return vff.split(",")[0].trim()
  return "unknown"
}

export async function POST(req: NextRequest) {
  try {
    // 1. Consent check — server-side cookie is the source of truth.
    const consent = parseConsentFromCookie(req.headers.get("cookie"))
    if (!consent || consent === "none") {
      return NextResponse.json({ ok: true, skipped: true })
    }

    // 2. Rate limit per IP.
    const ip = clientIpOf(req)
    const rl = rateLimit(`log:${ip}`, RATE_LIMIT_PER_MINUTE, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } },
      )
    }

    // 3. Body size cap (cheap reject before we parse anything).
    const contentLength = Number(req.headers.get("content-length") ?? 0)
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 })
    }

    // 4. Validate body shape with zod.
    let raw: unknown
    try {
      raw = await req.json()
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
    }
    const parsed = PAYLOAD_SCHEMA.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 })
    }
    const body = parsed.data

    // 5. Build Supabase client lazily — if unconfigured, silently skip.
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    // 6. Geo + headers from Vercel/Cloudflare edge.
    const cfIpCountry = req.headers.get("cf-ipcountry")
    const vercelIpCountry = req.headers.get("x-vercel-ip-country")
    const country = cfIpCountry || vercelIpCountry || null
    const region = req.headers.get("x-vercel-ip-country-region") || null
    const city = req.headers.get("x-vercel-ip-city") || null
    const ipLatitude = req.headers.get("x-vercel-ip-latitude") || null
    const ipLongitude = req.headers.get("x-vercel-ip-longitude") || null
    const timezone = req.headers.get("x-vercel-ip-timezone") || null
    const continent = req.headers.get("x-vercel-ip-continent") || null
    const asNumber = req.headers.get("x-vercel-ip-as-number") || null
    const userAgent = req.headers.get("user-agent") || null
    const referer = req.headers.get("referer") || null

    const locationParts = [city, region, country].filter(Boolean)
    const location = locationParts.length > 0 ? locationParts.join(", ") : null

    // Headers blob — filter sensitive headers, cap each value, and cap the whole
    // serialized object so a malicious client can't bloat the DB.
    const headersForLog: Record<string, string> = {}
    req.headers.forEach((value, key) => {
      const lower = key.toLowerCase()
      if (
        lower.includes("cookie") ||
        lower.includes("authorization") ||
        lower.includes("oidc-token") ||
        lower.includes("signature")
      ) {
        return
      }
      headersForLog[key] = value.length > 256 ? value.slice(0, 256) + "…" : value
    })

    if (ipLatitude && ipLongitude) {
      headersForLog["_ip_geo_latitude"] = ipLatitude
      headersForLog["_ip_geo_longitude"] = ipLongitude
    }
    if (body.gpsLocation) {
      headersForLog["_gps_latitude"] = String(body.gpsLocation.latitude)
      headersForLog["_gps_longitude"] = String(body.gpsLocation.longitude)
      headersForLog["_gps_accuracy_meters"] = String(body.gpsLocation.accuracy ?? 0)
      if (body.gpsLocation.altitude !== null && body.gpsLocation.altitude !== undefined) {
        headersForLog["_gps_altitude"] = String(body.gpsLocation.altitude)
      }
      if (body.gpsLocation.speed !== null && body.gpsLocation.speed !== undefined) {
        headersForLog["_gps_speed"] = String(body.gpsLocation.speed)
      }
      if (body.gpsLocation.heading !== null && body.gpsLocation.heading !== undefined) {
        headersForLog["_gps_heading"] = String(body.gpsLocation.heading)
      }
    }
    if (timezone) headersForLog["_ip_timezone"] = timezone
    if (continent) headersForLog["_ip_continent"] = continent
    if (asNumber) headersForLog["_ip_as_number"] = asNumber

    // Final headers-size cap — drop the blob entirely if oversize.
    let headersSerialized = JSON.stringify(headersForLog)
    let headersForInsert: Record<string, string> | null = headersForLog
    if (headersSerialized.length > MAX_HEADERS_BYTES) {
      headersForInsert = { _truncated: "true", _original_size: String(headersSerialized.length) }
      headersSerialized = JSON.stringify(headersForInsert)
    }
    void headersSerialized // satisfy the linter — kept for symmetry with the size check above

    const finalLatitude = body.gpsLocation?.latitude ?? (ipLatitude ? Number.parseFloat(ipLatitude) : null)
    const finalLongitude = body.gpsLocation?.longitude ?? (ipLongitude ? Number.parseFloat(ipLongitude) : null)

    // 7. Insert. Any error is swallowed into a generic response.
    const { error } = await supabase.from("card_requests").insert({
      amount_aed: body.purchase.amountAED,
      category: body.purchase.category,
      channel: body.purchase.channel,

      best_card_id: body.bestCard?.cardId || null,
      best_card_name: body.bestCard?.cardName || null,
      best_card_effective_rate: body.bestCard?.effectiveRate ?? null,
      best_card_reward_value_aed: body.bestCard?.rewardValueAED ?? null,

      all_results: body.results,
      card_settings_snapshot: body.settings,

      user_agent: userAgent,
      ip: ip === "unknown" ? null : ip,
      referer,
      location,
      country,
      region,
      city,
      latitude: finalLatitude,
      longitude: finalLongitude,

      headers: headersForInsert,
    })

    if (error) {
      // Log the real error server-side, return a generic one to the client.
      console.error("[log-card-request] supabase insert failed:", error.code, error.message)
      return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[log-card-request] unexpected error:", error)
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 })
  }
}

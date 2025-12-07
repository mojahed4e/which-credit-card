/**
 * Client-side function to log card requests.
 *
 * This function is called after computing the best card.
 * It respects user consent and sends data to /api/log-card-request.
 *
 * Logging is non-blocking and best-effort:
 * - Never blocks the UI
 * - Fails silently on errors
 * - Skips entirely if consent is "none"
 */

import type { CardSettings, ComputeResult, PurchaseInput } from "./cards"
import { getConsentFromStorage, type ConsentLevel } from "./consent"

export interface LogCardRequestPayload {
  purchase: PurchaseInput
  bestCard: ComputeResult["bestCard"]
  results: ComputeResult["results"]
  settings: CardSettings
  consent: ConsentLevel
}

/**
 * Log a card request to Supabase (non-blocking).
 * Call this with `void logCardRequest(...)` to avoid awaiting.
 */
export async function logCardRequest(
  purchase: PurchaseInput,
  result: ComputeResult,
  settings: CardSettings,
): Promise<void> {
  try {
    const consent = getConsentFromStorage()

    // Skip logging if no consent or consent is "none"
    if (!consent || consent === "none") {
      return
    }

    const payload: LogCardRequestPayload = {
      purchase,
      bestCard: result.bestCard,
      results: result.results,
      settings,
      consent,
    }

    await fetch("/api/log-card-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    // Fail silently - logging should never break the app
    console.error("[v0] Failed to log card request:", error)
  }
}

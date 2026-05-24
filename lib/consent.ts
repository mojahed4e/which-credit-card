/**
 * Consent management utilities for GDPR-compliant logging.
 *
 * Consent is stored in both:
 * - Cookie (whichcard_consent) - for server-side access
 * - localStorage (whichcard_consent) - for quick client-side checks
 *
 * Consent levels:
 * - "full": Full logging with IP, user_agent, location, etc.
 * - "none": No personal data logging (skip logging entirely)
 */

export type ConsentLevel = "full" | "none"

export const CONSENT_COOKIE_NAME = "whichcard_consent"
export const CONSENT_STORAGE_KEY = "whichcard_consent"

/**
 * Get current consent level from localStorage (client-side only)
 */
export function getConsentFromStorage(): ConsentLevel | null {
  if (typeof window === "undefined") return null
  const value = localStorage.getItem(CONSENT_STORAGE_KEY)
  if (value === "full" || value === "none") return value
  return null
}

/**
 * Set consent in both cookie and localStorage
 */
export function setConsent(level: ConsentLevel): void {
  if (typeof window === "undefined") return

  const maxAge = 60 * 60 * 24 * 365 // 1 year in seconds
  // Add `Secure` only when served over HTTPS — otherwise the cookie is silently
  // dropped in local dev (where http://localhost has no Secure context).
  const secureFlag = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${CONSENT_COOKIE_NAME}=${level}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`

  localStorage.setItem(CONSENT_STORAGE_KEY, level)
}

/**
 * Check if consent has been given (either way)
 */
export function hasConsentDecision(): boolean {
  return getConsentFromStorage() !== null
}

/**
 * Clear consent (for testing or user request)
 */
export function clearConsent(): void {
  if (typeof window === "undefined") return

  const secureFlag = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${CONSENT_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax${secureFlag}`

  localStorage.removeItem(CONSENT_STORAGE_KEY)
}

/**
 * Lightweight per-IP rate limiter using a sliding window kept in module scope.
 *
 * Caveats — read before relying on this:
 *  - Module scope persists only for the lifetime of a warm serverless function
 *    instance. A distributed attacker hitting many cold-start instances can
 *    exceed these limits. For real protection at scale, swap this for Vercel KV
 *    or Upstash Ratelimit.
 *  - Memory usage grows with unique IPs until the entries expire. We sweep
 *    on every call to keep it bounded.
 */

interface Bucket {
  /** Timestamps (ms) of recent requests, oldest first. */
  hits: number[]
}

const buckets = new Map<string, Bucket>()

const SWEEP_EVERY_N_CALLS = 100
let callsSinceSweep = 0

function sweep(now: number, windowMs: number) {
  for (const [ip, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((t) => now - t < windowMs)
    if (bucket.hits.length === 0) buckets.delete(ip)
  }
}

export interface RateLimitResult {
  allowed: boolean
  /** Number of hits remaining inside the current window after this call. */
  remaining: number
  /** Milliseconds until the oldest hit in the bucket falls outside the window. */
  resetMs: number
}

/**
 * @param key       Usually the client IP. Use a stable identifier — never trust
 *                  user-controllable headers blindly (this is fine for IP from
 *                  cf-connecting-ip / vercel forwarded headers because Vercel
 *                  injects them).
 * @param limit     Max requests allowed per window.
 * @param windowMs  Window size in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()

  if (++callsSinceSweep >= SWEEP_EVERY_N_CALLS) {
    callsSinceSweep = 0
    sweep(now, windowMs)
  }

  let bucket = buckets.get(key)
  if (!bucket) {
    bucket = { hits: [] }
    buckets.set(key, bucket)
  }

  // Drop expired hits before deciding.
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs)

  if (bucket.hits.length >= limit) {
    const resetMs = bucket.hits[0] + windowMs - now
    return { allowed: false, remaining: 0, resetMs: Math.max(0, resetMs) }
  }

  bucket.hits.push(now)
  return { allowed: true, remaining: limit - bucket.hits.length, resetMs: windowMs }
}

/**
 * Browser Geolocation API utilities
 *
 * Provides precise GPS location from the user's device.
 * Requires explicit user permission via browser prompt.
 */

export interface GeoPosition {
  latitude: number
  longitude: number
  accuracy: number // meters
  altitude: number | null
  altitudeAccuracy: number | null
  heading: number | null
  speed: number | null
  timestamp: number
}

export interface GeolocationResult {
  success: boolean
  position?: GeoPosition
  error?: string
  errorCode?: number
}

// Cache the last known position for 5 minutes
let cachedPosition: GeoPosition | null = null
let cacheTimestamp = 0
const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Check if browser supports geolocation
 */
export function isGeolocationSupported(): boolean {
  return typeof window !== "undefined" && "geolocation" in navigator
}

/**
 * Get the current position from the browser's Geolocation API.
 * This will prompt the user for permission if not already granted.
 *
 * @param highAccuracy - Request high accuracy (GPS). Uses more battery.
 * @param timeoutMs - Maximum time to wait for position (default: 10s)
 */
export function getCurrentPosition(highAccuracy = true, timeoutMs = 10000): Promise<GeolocationResult> {
  return new Promise((resolve) => {
    if (!isGeolocationSupported()) {
      resolve({
        success: false,
        error: "Geolocation not supported by this browser",
        errorCode: 0,
      })
      return
    }

    // Return cached position if still valid
    if (cachedPosition && Date.now() - cacheTimestamp < CACHE_DURATION_MS) {
      resolve({
        success: true,
        position: cachedPosition,
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const position: GeoPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          altitudeAccuracy: pos.coords.altitudeAccuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        }

        // Cache the position
        cachedPosition = position
        cacheTimestamp = Date.now()

        resolve({
          success: true,
          position,
        })
      },
      (err) => {
        let errorMessage = "Unknown error"
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Location permission denied"
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable"
            break
          case err.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }
        resolve({
          success: false,
          error: errorMessage,
          errorCode: err.code,
        })
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: timeoutMs,
        maximumAge: CACHE_DURATION_MS,
      },
    )
  })
}

/**
 * Check if geolocation permission is already granted
 */
export async function checkGeolocationPermission(): Promise<"granted" | "denied" | "prompt" | "unknown"> {
  if (!isGeolocationSupported()) return "unknown"

  try {
    if ("permissions" in navigator) {
      const result = await navigator.permissions.query({ name: "geolocation" })
      return result.state as "granted" | "denied" | "prompt"
    }
  } catch {
    // permissions API not supported
  }

  return "unknown"
}

/**
 * Clear the cached position
 */
export function clearPositionCache(): void {
  cachedPosition = null
  cacheTimestamp = 0
}

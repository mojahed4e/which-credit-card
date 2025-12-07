/**
 * Supabase server client for logging card requests.
 *
 * This file creates a Supabase client using the SERVICE ROLE KEY
 * which bypasses RLS. This is necessary because the card_requests table
 * has RLS enabled with restrictive policies.
 *
 * IMPORTANT: Only use this client in server-side code (API routes, server actions).
 * Never import or expose the service role key to the client.
 */

import { createClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase admin client for server-side logging.
 * Returns null if environment variables are not configured.
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn("[v0] Supabase environment variables not configured. Logging will be skipped.")
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Server-side Supabase client placeholder.
 *
 * - Use `SUPABASE_SERVICE_ROLE_KEY` for privileged server operations.
 * - Do NOT commit secrets; set env vars in Vercel / GitHub Secrets / local .env.
 *
 * This file provides a small factory that returns a Supabase client for server
 * usage. Replace or extend with project-specific helpers as needed.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

declare global {
  // eslint-disable-next-line no-var
  var __supabase_server_client__: SupabaseClient | undefined
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function chooseKey() {
  // Prefer service role (server-only) when available; fallback to anon for non-privileged actions.
  return SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY
}

export function getSupabaseServerClient(): SupabaseClient {
  if (!SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  const key = chooseKey()
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  // Reuse client during dev/HMR to avoid multiple connections.
  if (process.env.NODE_ENV === 'development') {
    if (!global.__supabase_server_client__) {
      global.__supabase_server_client__ = createClient(SUPABASE_URL, key, {
        auth: { persistSession: false },
      })
    }
    return global.__supabase_server_client__
  }

  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false },
  })
}

export default getSupabaseServerClient
// Placeholder Supabase server client. Replace with real keys in server env only.
import { createClient } from '@supabase/supabase-js'

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!url || !key) {
    // In Stage 1 we keep placeholders; do NOT commit real keys.
    return null
  }
  return createClient(url, key)
}

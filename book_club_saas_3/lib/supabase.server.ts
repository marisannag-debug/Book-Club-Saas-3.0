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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL environment variable')
}

export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : undefined

export function getSupabaseServerClient(): SupabaseClient {
  const key = SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global.__supabase_server_client__) {
      global.__supabase_server_client__ = createClient(SUPABASE_URL, key, { auth: { persistSession: false } })
    }
    return global.__supabase_server_client__
  }

  return createClient(SUPABASE_URL, key, { auth: { persistSession: false } })
}

export default getSupabaseServerClient

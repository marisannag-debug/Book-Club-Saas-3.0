/**
 * Server-side Supabase placeholder.
 * Keep this file as the integration point, but do not wire the SDK until the
 * backend actually needs it.
 */

export function getSupabaseServerClient() {
  throw new Error('Supabase server client is not wired yet.')
}

export const supabaseAdmin = undefined

export default getSupabaseServerClient

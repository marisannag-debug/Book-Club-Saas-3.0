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

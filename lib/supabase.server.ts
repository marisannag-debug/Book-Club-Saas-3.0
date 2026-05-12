import { createClient } from "@supabase/supabase-js";

type SupabaseServerClient = ReturnType<typeof createClient>;

let supabaseServerClient: SupabaseServerClient | null = null;

function getSupabaseServerConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl) {
    throw new Error(
      "Brakuje konfiguracji Supabase. Ustaw NEXT_PUBLIC_SUPABASE_URL oraz SUPABASE_SERVICE_ROLE_KEY lub NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

  if (!supabaseKey) {
    throw new Error(
      "Brakuje konfiguracji Supabase. Ustaw SUPABASE_SERVICE_ROLE_KEY lub NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const normalizedSupabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

  return {
    supabaseKey,
    supabaseUrl: normalizedSupabaseUrl,
  };
}

export function resetSupabaseServerClientForTests() {
  supabaseServerClient = null;
}

export function getSupabaseServerClient() {
  if (!supabaseServerClient) {
    const { supabaseKey, supabaseUrl } = getSupabaseServerConfig();

    supabaseServerClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }

  return supabaseServerClient;
}

export const supabaseAdmin = getSupabaseServerClient;

export default getSupabaseServerClient;

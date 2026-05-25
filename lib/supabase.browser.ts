import { createClient } from "@supabase/supabase-js";
import type { SupabaseAppClient, SupabaseDatabase } from "./supabase.types";

type SupabaseBrowserClient = SupabaseAppClient;

declare global {
  // eslint-disable-next-line no-var
  var __supabaseBrowserClient: SupabaseBrowserClient | undefined;
}

function getSupabaseBrowserConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Brakuje konfiguracji Supabase. Ustaw NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const normalizedSupabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

  return {
    supabaseAnonKey,
    supabaseUrl: normalizedSupabaseUrl,
  };
}

export function getSupabaseBrowserClient() {
  if (!globalThis.__supabaseBrowserClient) {
    const { supabaseAnonKey, supabaseUrl } = getSupabaseBrowserConfig();

    globalThis.__supabaseBrowserClient = createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey);
  }

  return globalThis.__supabaseBrowserClient;
}

export function resetSupabaseBrowserClientForTests() {
  globalThis.__supabaseBrowserClient = undefined;
}

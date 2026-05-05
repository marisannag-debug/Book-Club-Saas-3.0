// Minimal auth helpers (placeholders). Integrate with Supabase or chosen backend.
export async function registerUser(email: string, password: string) {
  // TODO: replace with Supabase client call (or API route)
  return { ok: true, message: `Zarejestrowano: ${email} (mock)` };
}

export async function loginUser(email: string, password: string) {
  // TODO: replace with Supabase client call (or API route)
  return { ok: true, message: `Zalogowano: ${email} (mock)` };
}

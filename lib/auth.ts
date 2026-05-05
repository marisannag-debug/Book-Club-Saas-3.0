type AuthResult = {
  ok: boolean;
  message: string;
};

function buildMockAuthResult(action: string, email: string): AuthResult {
  return { ok: true, message: `${action}: ${email} (mock)` };
}

// Minimal auth helpers (placeholders). Integrate with Supabase or chosen backend.
export async function registerUser(email: string, _password: string): Promise<AuthResult> {
  return buildMockAuthResult('Zarejestrowano', email);
}

export async function loginUser(email: string, _password: string): Promise<AuthResult> {
  return buildMockAuthResult('Zalogowano', email);
}

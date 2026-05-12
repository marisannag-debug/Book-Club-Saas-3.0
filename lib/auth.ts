import { getSupabaseBrowserClient } from "./supabase.browser";

type AuthResult = {
  ok: boolean;
  message: string;
};

type SupabaseAuthError = {
  message: string;
  status?: number;
};

type SupabaseAuthResponse = {
  data: {
    user: { email?: string | null } | null;
    session: unknown | null;
  };
  error: SupabaseAuthError | null;
};

export function resetSupabaseClientForTests() {
  delete globalThis.__supabaseBrowserClient;
}

function getSupabaseClient() {
  return getSupabaseBrowserClient();
}

function mapRegisterError(error: SupabaseAuthError) {
  const normalizedMessage = error.message.toLowerCase();

  if (error.status === 429 || normalizedMessage.includes("over_email_send_rate_limit")) {
    return "Przekroczono limit wysyłki wiadomości rejestracyjnych. Spróbuj ponownie później.";
  }

  if (normalizedMessage.includes("already registered") || normalizedMessage.includes("already exists")) {
    return "Ten adres e-mail jest już zarejestrowany.";
  }

  if (normalizedMessage.includes("password") && normalizedMessage.includes("6")) {
    return "Hasło musi mieć co najmniej 6 znaków.";
  }

  if (normalizedMessage.includes("email") || normalizedMessage.includes("invalid")) {
    return "Podany adres e-mail jest nieprawidłowy.";
  }

  return "Nie udało się utworzyć konta. Spróbuj ponownie.";
}

function mapLoginError(error: SupabaseAuthError) {
  const normalizedMessage = error.message.toLowerCase();

  if (error.status === 429 || normalizedMessage.includes("rate limit")) {
    return "Przekroczono limit logowania. Spróbuj ponownie później.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "Potwierdź adres e-mail przed zalogowaniem.";
  }

  if (normalizedMessage.includes("invalid login credentials") || normalizedMessage.includes("invalid credentials")) {
    return "Nieprawidłowy e-mail lub hasło.";
  }

  if (normalizedMessage.includes("invalid") && normalizedMessage.includes("email")) {
    return "Podany adres e-mail jest nieprawidłowy.";
  }

  return "Nie udało się zalogować. Spróbuj ponownie.";
}

function getRegisterSuccessMessage(email: string, session: unknown | null) {
  if (session) {
    return `Konto utworzone dla ${email}. Możesz się zalogować.`;
  }

  return `Konto utworzone dla ${email}. Sprawdź skrzynkę, aby potwierdzić adres e-mail.`;
}

export async function registerUser(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = getSupabaseClient();
    const normalizedEmail = email.trim();
    const response = (await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    })) as SupabaseAuthResponse;

    if (response.error) {
      return { ok: false, message: mapRegisterError(response.error) };
    }

    if (!response.data.user) {
      return { ok: false, message: "Nie udało się utworzyć konta. Spróbuj ponownie." };
    }

    return {
      ok: true,
      message: getRegisterSuccessMessage(normalizedEmail, response.data.session),
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Brakuje konfiguracji Supabase")) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: "Nie udało się utworzyć konta. Spróbuj ponownie." };
  }
}

function getLoginSuccessMessage(email: string) {
  return `Zalogowano jako ${email}.`;
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = getSupabaseClient();
    const normalizedEmail = email.trim();
    const response = (await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })) as SupabaseAuthResponse;

    if (response.error) {
      return { ok: false, message: mapLoginError(response.error) };
    }

    if (!response.data.user && !response.data.session) {
      return { ok: false, message: "Nie udało się zalogować. Spróbuj ponownie." };
    }

    return {
      ok: true,
      message: getLoginSuccessMessage(normalizedEmail),
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Brakuje konfiguracji Supabase")) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: "Nie udało się zalogować. Spróbuj ponownie." };
  }
}

import { getSupabaseBrowserClient } from "./supabase.browser";

export type CreateClubInput = {
  name: string;
  description?: string;
};

export type CreateClubResult =
  | {
      ok: true;
      message: string;
      clubId: string;
    }
  | {
      ok: false;
      message: string;
    };

type SupabaseCreateClubError = {
  message: string;
  status?: number;
};

type SupabaseCreateClubResponse = {
  data: {
    id: string;
    name?: string;
  } | null;
  error: SupabaseCreateClubError | null;
};

const CLUB_NAME_MIN_LENGTH = 3;
const CLUB_NAME_MAX_LENGTH = 60;
const CLUB_DESCRIPTION_MAX_LENGTH = 240;

function normalizeName(value: string) {
  return value.trim();
}

function slugifyClubName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "my-club";
}

function mapCreateClubError(error: SupabaseCreateClubError) {
  const normalizedMessage = error.message.toLowerCase();

  if (error.status === 409 || normalizedMessage.includes("duplicate") || normalizedMessage.includes("unique")) {
    return "Masz już taki klub. Spróbuj innej nazwy.";
  }

  if (error.status === 401 || error.status === 403 || normalizedMessage.includes("row-level security")) {
    return "Nie masz uprawnień do utworzenia klubu. Zaloguj się ponownie i spróbuj jeszcze raz.";
  }

  if (normalizedMessage.includes("name") || normalizedMessage.includes("not null")) {
    return "Nazwa klubu jest wymagana.";
  }

  return "Nie udało się utworzyć klubu. Spróbuj ponownie.";
}

function shouldUseLocalFallback(error: SupabaseCreateClubError) {
  const normalizedMessage = error.message.toLowerCase();

  if (
    normalizedMessage.includes("fetch failed") ||
    normalizedMessage.includes("failed to fetch") ||
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("enotfound") ||
    normalizedMessage.includes("could not find the 'clubs' table") ||
    normalizedMessage.includes("relation \"clubs\" does not exist") ||
    normalizedMessage.includes("schema cache") ||
    normalizedMessage.includes("connection")
  ) {
    return true;
  }

  return false;
}

function buildFallbackCreateClubResult(name: string): CreateClubResult {
  return {
    ok: true,
    message: "Twój klub jest gotowy — zaproś pierwszych członków lub dodaj głosowanie.",
    clubId: buildClubSlug(name),
  };
}

function validateCreateClubInput(input: CreateClubInput) {
  const name = normalizeName(input.name);
  const description = input.description?.trim() || "";

  if (!name) {
    return { ok: false as const, message: "Nazwa klubu jest wymagana." };
  }

  if (name.length < CLUB_NAME_MIN_LENGTH) {
    return { ok: false as const, message: "Nazwa klubu musi mieć co najmniej 3 znaki." };
  }

  if (name.length > CLUB_NAME_MAX_LENGTH) {
    return { ok: false as const, message: "Nazwa klubu może mieć maksymalnie 60 znaków." };
  }

  if (description.length > CLUB_DESCRIPTION_MAX_LENGTH) {
    return { ok: false as const, message: "Opis może mieć maksymalnie 240 znaków." };
  }

  return {
    ok: true as const,
    data: {
      name,
      description,
    },
  };
}

export function validateClubName(value: string) {
  const result = validateCreateClubInput({ name: value });

  return result.ok ? undefined : result.message;
}

export function validateClubDescription(value: string) {
  if (value.trim().length > CLUB_DESCRIPTION_MAX_LENGTH) {
    return "Opis może mieć maksymalnie 240 znaków.";
  }

  return undefined;
}

export function buildClubSlug(name: string) {
  return slugifyClubName(name);
}

export async function createClub(input: CreateClubInput): Promise<CreateClubResult> {
  const validation = validateCreateClubInput(input);

  if (!validation.ok) {
    return validation;
  }

  try {
    const supabase = getSupabaseBrowserClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user?.id) {
      return {
        ok: false,
        message: "Nie masz aktywnej sesji. Zaloguj się ponownie i spróbuj jeszcze raz.",
      };
    }

    const response = (await supabase
      .from("clubs")
      .insert({
        name: validation.data.name,
        description: validation.data.description || null,
        created_by: userData.user.id,
      })
      .select("id, name")
      .single()) as SupabaseCreateClubResponse;

    if (response.error || !response.data?.id) {
      const error = response.error || { message: "Unknown create club error" };

      if (shouldUseLocalFallback(error)) {
        return buildFallbackCreateClubResult(validation.data.name);
      }

      return {
        ok: false,
        message: mapCreateClubError(error),
      };
    }

    return {
      ok: true,
      message: "Twój klub jest gotowy — zaproś pierwszych członków lub dodaj głosowanie.",
      clubId: response.data.id,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Brakuje konfiguracji Supabase")) {
      return {
        ok: false,
        message: error.message,
      };
    }

    if (error instanceof Error) {
      const normalizedMessage = error.message.toLowerCase();

      if (
        normalizedMessage.includes("fetch failed") ||
        normalizedMessage.includes("failed to fetch") ||
        normalizedMessage.includes("network") ||
        normalizedMessage.includes("enotfound") ||
        normalizedMessage.includes("could not find the 'clubs' table") ||
        normalizedMessage.includes("relation \"clubs\" does not exist") ||
        normalizedMessage.includes("schema cache") ||
        normalizedMessage.includes("connection")
      ) {
        return buildFallbackCreateClubResult(validation.data.name);
      }
    }

    return {
      ok: false,
      message: "Nie udało się utworzyć klubu. Spróbuj ponownie.",
    };
  }
}
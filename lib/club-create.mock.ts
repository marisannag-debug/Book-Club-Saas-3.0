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

const CLUB_NAME_MIN_LENGTH = 3;
const CLUB_NAME_MAX_LENGTH = 60;
const CLUB_DESCRIPTION_MAX_LENGTH = 240;

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

export async function createClubPreview(input: CreateClubInput): Promise<CreateClubResult> {
  const name = input.name.trim();
  const description = input.description?.trim() || "";

  if (!name) {
    return {
      ok: false,
      message: "Nazwa klubu jest wymagana.",
    };
  }

  if (name.length < CLUB_NAME_MIN_LENGTH) {
    return {
      ok: false,
      message: "Nazwa klubu musi mieć co najmniej 3 znaki.",
    };
  }

  if (name.length > CLUB_NAME_MAX_LENGTH) {
    return {
      ok: false,
      message: "Nazwa klubu może mieć maksymalnie 60 znaków.",
    };
  }

  if (description.length > CLUB_DESCRIPTION_MAX_LENGTH) {
    return {
      ok: false,
      message: "Opis może mieć maksymalnie 240 znaków.",
    };
  }

  const clubId = slugifyClubName(name);

  return {
    ok: true,
    message: "Twój klub jest gotowy — zaproś pierwszych członków lub dodaj głosowanie.",
    clubId,
  };
}

export { slugifyClubName };
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "../supabase.server";
import type { SupabaseDatabase } from "../supabase.types";
import {
  bookProposalCreateSchema,
  bookProposalListQuerySchema,
  bookProposalUpdateSchema,
  mapBookProposalViewModel,
  normalizeOptionalText,
  type BookProposalCreateInput,
  type BookProposalListQuery,
  type BookProposalUpdateInput,
  type BookProposalViewModel,
} from "../book-proposals";

type SupabaseAuthResult = {
  data: {
    user: {
      id: string;
      email?: string | null;
    } | null;
  };
  error: { message: string } | null;
};

type ClubRow = {
  id: string;
  name: string;
  created_by: string;
  created_at?: string;
};

type ClubMemberRow = {
  user_id: string;
  role: "host" | "member" | null;
  membership_status: "pending" | "active" | "left" | null;
};

type BookProposalRow = {
  id: string;
  club_id: string;
  title: string;
  author: string;
  description: string | null;
  cover_image_url: string | null;
  cover_image_name: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type AuthenticatedUser = {
  id: string;
  email?: string | null;
};

class BookProposalError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function extractAccessToken(accessToken: string) {
  return accessToken.trim().replace(/^Bearer\s+/i, "");
}

function getSupabaseRequestConfig(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const normalizedAccessToken = extractAccessToken(accessToken);

  if (!supabaseUrl) {
    throw new Error(
      "Brakuje konfiguracji Supabase. Ustaw NEXT_PUBLIC_SUPABASE_URL oraz NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  if (!supabaseAnonKey) {
    throw new Error("Brakuje konfiguracji Supabase. Ustaw NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return {
    supabaseAnonKey,
    supabaseUrl: supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, ""),
    accessToken: normalizedAccessToken,
  };
}

function createRequestSupabaseClient(accessToken: string) {
  const { supabaseAnonKey, supabaseUrl, accessToken: normalizedAccessToken } = getSupabaseRequestConfig(accessToken);

  return createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${normalizedAccessToken}`,
      },
    },
  });
}

function normalizeClubId(clubId: string) {
  return clubId.trim();
}

function toErrorResult(error: unknown) {
  if (error instanceof BookProposalError) {
    return {
      ok: false as const,
      status: error.status,
      message: error.message,
    };
  }

  return {
    ok: false as const,
    status: 500,
    message: "Nie udało się przetworzyć propozycji książki. Spróbuj ponownie.",
  };
}

async function getAuthenticatedUser(accessToken: string): Promise<AuthenticatedUser | null> {
  const supabase = createRequestSupabaseClient(accessToken);
  const response = (await supabase.auth.getUser()) as SupabaseAuthResult;

  if (response.error || !response.data.user?.id) {
    return null;
  }

  return response.data.user;
}

async function requireAuthenticatedUser(accessToken: string) {
  const user = await getAuthenticatedUser(accessToken);

  if (!user) {
    throw new BookProposalError(401, "Nie masz aktywnej sesji. Zaloguj się ponownie i spróbuj jeszcze raz.");
  }

  return user;
}

async function findClubById(clubId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("clubs").select("id, name, created_by, created_at").eq("id", clubId).maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ClubRow;
}

async function listActiveClubMembers(clubId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("club_members")
    .select("user_id, role, membership_status")
    .eq("club_id", clubId)
    .order("user_id", { ascending: true });

  if (error || !data) {
    throw new BookProposalError(400, "Nie udało się odczytać członków klubu.");
  }

  return (data as ClubMemberRow[]).filter(
    (member) => member.membership_status !== "left" && member.membership_status !== "pending",
  );
}

function getCurrentUserRole(club: ClubRow, members: ClubMemberRow[], userId: string) {
  if (club.created_by === userId) {
    return "host" as const;
  }

  const membership = members.find((member) => member.user_id === userId);

  if (!membership) {
    return null;
  }

  if (membership.membership_status && membership.membership_status !== "active") {
    return null;
  }

  return (membership.role ?? "member") as "host" | "member";
}

async function loadClubAccess(clubId: string, accessToken: string) {
  const normalizedClubId = normalizeClubId(clubId);

  if (!normalizedClubId) {
    throw new BookProposalError(400, "Brakuje identyfikatora klubu.");
  }

  const user = await requireAuthenticatedUser(accessToken);
  const club = await findClubById(normalizedClubId);

  if (!club) {
    throw new BookProposalError(404, "Nie znaleziono klubu.");
  }

  const members = await listActiveClubMembers(club.id);
  const currentUserRole = getCurrentUserRole(club, members, user.id);

  if (!currentUserRole) {
    throw new BookProposalError(403, "Nie masz dostępu do propozycji tego klubu.");
  }

  return {
    user,
    club,
    currentUserRole,
  };
}

async function loadProposalById(proposalId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("book_proposals")
    .select("id, club_id, title, author, description, cover_image_url, cover_image_name, created_by, created_at, updated_at")
    .eq("id", proposalId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as BookProposalRow;
}

function mapProposal(row: BookProposalRow, userId?: string, userRole?: "host" | "member" | null): BookProposalViewModel {
  return mapBookProposalViewModel(row, userId, userRole);
}

function buildBookProposalInsertPayload(input: BookProposalCreateInput, userId: string, clubId: string) {
  return {
    club_id: clubId,
    title: input.title.trim(),
    author: input.author.trim(),
    description: normalizeOptionalText(input.description),
    cover_image_url: normalizeOptionalText(input.coverImageUrl),
    cover_image_name: normalizeOptionalText(input.coverImageName),
    created_by: userId,
  };
}

function buildBookProposalPatchPayload(input: BookProposalUpdateInput) {
  const patch: Partial<Pick<BookProposalRow, "title" | "author" | "description" | "cover_image_url" | "cover_image_name">> = {};

  if (input.title !== undefined) {
    patch.title = input.title.trim();
  }

  if (input.author !== undefined) {
    patch.author = input.author.trim();
  }

  if (input.description !== undefined) {
    patch.description = normalizeOptionalText(input.description);
  }

  if (input.coverImageUrl !== undefined) {
    patch.cover_image_url = normalizeOptionalText(input.coverImageUrl);
  }

  if (input.coverImageName !== undefined) {
    patch.cover_image_name = normalizeOptionalText(input.coverImageName);
  }

  return patch;
}

export type BookProposalsResult =
  | {
      ok: true;
      status: 200;
      clubId: string;
      items: BookProposalViewModel[];
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

export type BookProposalMutationResult =
  | {
      ok: true;
      status: 201 | 200;
      message: string;
      proposal: BookProposalViewModel;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

export type BookProposalDeleteResult =
  | {
      ok: true;
      status: 200;
      message: string;
      proposalId: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

export async function listBookProposals(clubId: string, accessToken: string): Promise<BookProposalsResult> {
  try {
    const parsed = bookProposalListQuerySchema.safeParse({ clubId });

    if (!parsed.success) {
      throw new BookProposalError(400, parsed.error.issues[0]?.message ?? "Brakuje identyfikatora klubu.");
    }

    const access = await loadClubAccess(parsed.data.clubId, accessToken);
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("book_proposals")
      .select("id, club_id, title, author, description, cover_image_url, cover_image_name, created_by, created_at, updated_at")
      .eq("club_id", access.club.id)
      .order("created_at", { ascending: false });

    if (error || !data) {
      throw new BookProposalError(400, "Nie udało się wczytać propozycji książek.");
    }

    return {
      ok: true,
      status: 200,
      clubId: access.club.id,
      items: (data as BookProposalRow[]).map((row) => mapProposal(row, access.user.id, access.currentUserRole)),
    };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function createBookProposal(input: BookProposalCreateInput, accessToken: string): Promise<BookProposalMutationResult> {
  try {
    const parsed = bookProposalCreateSchema.safeParse(input);

    if (!parsed.success) {
      throw new BookProposalError(400, parsed.error.issues[0]?.message ?? "Nieprawidłowe dane propozycji książki.");
    }

    const access = await loadClubAccess(parsed.data.clubId, accessToken);
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("book_proposals")
      .insert(buildBookProposalInsertPayload(parsed.data, access.user.id, access.club.id))
      .select("id, club_id, title, author, description, cover_image_url, cover_image_name, created_by, created_at, updated_at")
      .single();

    if (error || !data) {
      throw new BookProposalError(400, "Nie udało się utworzyć propozycji książki.");
    }

    return {
      ok: true,
      status: 201,
      message: "Propozycja książki została dodana.",
      proposal: mapProposal(data as BookProposalRow, access.user.id, access.currentUserRole),
    };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function updateBookProposal(input: BookProposalUpdateInput, accessToken: string): Promise<BookProposalMutationResult> {
  try {
    const parsed = bookProposalUpdateSchema.safeParse(input);

    if (!parsed.success) {
      throw new BookProposalError(400, parsed.error.issues[0]?.message ?? "Nieprawidłowe dane propozycji książki.");
    }

    const existingProposal = await loadProposalById(parsed.data.proposalId);

    if (!existingProposal) {
      throw new BookProposalError(404, "Nie znaleziono propozycji książki.");
    }

    const access = await loadClubAccess(existingProposal.club_id, accessToken);

    if (existingProposal.created_by !== access.user.id && access.currentUserRole !== "host") {
      throw new BookProposalError(403, "Nie masz uprawnień do edycji tej propozycji.");
    }

    const patch = buildBookProposalPatchPayload(parsed.data);

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("book_proposals")
      .update(patch)
      .eq("id", existingProposal.id)
      .select("id, club_id, title, author, description, cover_image_url, cover_image_name, created_by, created_at, updated_at")
      .single();

    if (error || !data) {
      throw new BookProposalError(400, "Nie udało się zaktualizować propozycji książki.");
    }

    return {
      ok: true,
      status: 200,
      message: "Propozycja książki została zaktualizowana.",
      proposal: mapProposal(data as BookProposalRow, access.user.id, access.currentUserRole),
    };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function deleteBookProposal(proposalId: string, accessToken: string): Promise<BookProposalDeleteResult> {
  try {
    const normalizedProposalId = proposalId.trim();

    if (!normalizedProposalId) {
      throw new BookProposalError(400, "Brakuje identyfikatora propozycji.");
    }

    const existingProposal = await loadProposalById(normalizedProposalId);

    if (!existingProposal) {
      throw new BookProposalError(404, "Nie znaleziono propozycji książki.");
    }

    const access = await loadClubAccess(existingProposal.club_id, accessToken);

    if (existingProposal.created_by !== access.user.id && access.currentUserRole !== "host") {
      throw new BookProposalError(403, "Nie masz uprawnień do usunięcia tej propozycji.");
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("book_proposals").delete().eq("id", existingProposal.id);

    if (error) {
      throw new BookProposalError(400, "Nie udało się usunąć propozycji książki.");
    }

    return {
      ok: true,
      status: 200,
      message: "Propozycja książki została usunięta.",
      proposalId: existingProposal.id,
    };
  } catch (error) {
    return toErrorResult(error);
  }
}

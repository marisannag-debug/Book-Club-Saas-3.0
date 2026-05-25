import { createClient } from "@supabase/supabase-js";
import { formatMemberName, type ClubRole, type MembershipStatus } from "./roles";
import { getSupabaseServerClient } from "../supabase.server";
import { normalizeMemberDisplayName, validateMemberDisplayName } from "../membership";
import type { SupabaseDatabase } from "../supabase.types";

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
  id: string;
  club_id: string;
  user_id: string;
  role: ClubRole | null;
  display_name: string | null;
  membership_status: MembershipStatus | null;
  joined_at: string;
  updated_at?: string | null;
};

type AuthenticatedUser = {
  id: string;
  email?: string | null;
};

type MembershipErrorResult = {
  ok: false;
  status: number;
  message: string;
};

type MembershipContext = {
  user: AuthenticatedUser;
  club: ClubRow;
  memberRow: ClubMemberRow | null;
  currentUserRole: ClubRole;
  isCreator: boolean;
};

export type MembershipView = {
  memberId: string;
  displayName: string;
  status: MembershipStatus;
  joinedAt: string;
  isCreator: boolean;
  canAccept: boolean;
  canLeave: boolean;
  canRename: boolean;
};

export type MembershipDetailsResult =
  | {
      ok: true;
      status: 200;
      clubId: string;
      clubName: string;
      currentUserRole: ClubRole;
      membership: MembershipView;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

export type MembershipActionResult =
  | {
      ok: true;
      status: 200;
      clubId: string;
      clubName: string;
      currentUserRole: ClubRole;
      message: string;
      membership: MembershipView;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

class MembershipError extends Error {
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
    throw new Error("Brakuje konfiguracji Supabase. Ustaw NEXT_PUBLIC_SUPABASE_URL oraz NEXT_PUBLIC_SUPABASE_ANON_KEY.");
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

function toErrorResult(error: unknown): MembershipErrorResult {
  if (error instanceof MembershipError) {
    return {
      ok: false as const,
      status: error.status,
      message: error.message,
    };
  }

  return {
    ok: false as const,
    status: 500,
    message: "Nie udało się przetworzyć członkostwa. Spróbuj ponownie.",
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
    throw new MembershipError(401, "Nie masz aktywnej sesji. Zaloguj się ponownie i spróbuj jeszcze raz.");
  }

  return user;
}

async function findClubById(clubId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("id, name, created_by, created_at")
    .eq("id", clubId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ClubRow;
}

async function findMembershipRow(clubId: string, userId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("club_members")
    .select("id, club_id, user_id, role, display_name, membership_status, joined_at, updated_at")
    .eq("club_id", clubId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ClubMemberRow;
}

async function listActiveHostRows(clubId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("club_members")
    .select("user_id, role, membership_status")
    .eq("club_id", clubId)
    .eq("membership_status", "active");

  if (error || !data) {
    throw new MembershipError(400, "Nie udało się odczytać stanu członkostwa klubu.");
  }

  return data as Array<Pick<ClubMemberRow, "user_id" | "role" | "membership_status">>;
}

function buildMembershipView(club: ClubRow, memberRow: ClubMemberRow | null, user: AuthenticatedUser): MembershipView {
  const isCreator = club.created_by === user.id;
  const effectiveRow = memberRow ?? (isCreator
    ? {
        id: `creator-${club.created_by}`,
        club_id: club.id,
        user_id: club.created_by,
        role: "host" as ClubRole,
        display_name: null,
        membership_status: "active" as MembershipStatus,
        joined_at: club.created_at ?? new Date(0).toISOString(),
        updated_at: null,
      }
    : null);

  if (!effectiveRow) {
    throw new MembershipError(403, "Nie masz dostępu do członkostwa tego klubu.");
  }

  if (effectiveRow.membership_status === "left") {
    throw new MembershipError(403, "To członkostwo zostało zakończone.");
  }

  const status = effectiveRow.membership_status ?? "active";
  const displayName = effectiveRow.display_name?.trim() || formatMemberName(user.id);

  return {
    memberId: effectiveRow.id,
    displayName,
    status,
    joinedAt: effectiveRow.joined_at,
    isCreator,
    canAccept: status === "pending",
    canLeave: !isCreator,
    canRename: true,
  };
}

async function loadMembershipContext(clubId: string, accessToken: string): Promise<MembershipContext> {
  const normalizedClubId = normalizeClubId(clubId);

  if (!normalizedClubId) {
    throw new MembershipError(400, "Brakuje identyfikatora klubu.");
  }

  const user = await requireAuthenticatedUser(accessToken);
  const club = await findClubById(normalizedClubId);

  if (!club) {
    throw new MembershipError(404, "Nie znaleziono klubu.");
  }

  const memberRow = await findMembershipRow(club.id, user.id);
  const isCreator = club.created_by === user.id;

  if (!memberRow && !isCreator) {
    throw new MembershipError(403, "Nie masz dostępu do tego członkostwa.");
  }

  if (memberRow?.membership_status === "left") {
    throw new MembershipError(403, "To członkostwo zostało zakończone.");
  }

  return {
    user,
    club,
    memberRow,
    currentUserRole: isCreator ? "host" : memberRow?.role ?? "member",
    isCreator,
  };
}

function buildMembershipSuccessResult(
  context: MembershipContext,
  membership: MembershipView,
  message: string,
): MembershipActionResult {
  return {
    ok: true,
    status: 200,
    clubId: context.club.id,
    clubName: context.club.name,
    currentUserRole: context.currentUserRole,
    message,
    membership,
  };
}

export async function getMembershipDetails(clubId: string, accessToken: string): Promise<MembershipDetailsResult> {
  try {
    const context = await loadMembershipContext(clubId, accessToken);

    return {
      ok: true,
      status: 200,
      clubId: context.club.id,
      clubName: context.club.name,
      currentUserRole: context.currentUserRole,
      membership: buildMembershipView(context.club, context.memberRow, context.user),
    };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function acceptMembership(clubId: string, accessToken: string): Promise<MembershipActionResult> {
  try {
    const context = await loadMembershipContext(clubId, accessToken);
    const membership = buildMembershipView(context.club, context.memberRow, context.user);

    if (membership.status === "active") {
      return buildMembershipSuccessResult(context, membership, "Członkostwo jest już aktywne.");
    }

    if (membership.status === "left") {
      throw new MembershipError(400, "Nie można zaakceptować zakończonego członkostwa.");
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("club_members")
      .update({ membership_status: "active" })
      .eq("club_id", context.club.id)
      .eq("user_id", context.user.id)
      .select("id, club_id, user_id, role, display_name, membership_status, joined_at, updated_at")
      .single();

    if (error || !data) {
      throw new MembershipError(400, "Nie udało się zaakceptować członkostwa.");
    }

    return buildMembershipSuccessResult(
      context,
      buildMembershipView(context.club, data as ClubMemberRow, context.user),
      "Członkostwo zostało aktywowane.",
    );
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function leaveClub(clubId: string, accessToken: string): Promise<MembershipActionResult> {
  try {
    const context = await loadMembershipContext(clubId, accessToken);

    if (context.isCreator) {
      throw new MembershipError(400, "Twórca klubu nie może opuścić klubu.");
    }

    const membership = buildMembershipView(context.club, context.memberRow, context.user);

    if (membership.status === "left") {
      throw new MembershipError(400, "To członkostwo jest już zakończone.");
    }

    if (membership.status === "active" && context.currentUserRole === "host") {
      const activeHostRows = await listActiveHostRows(context.club.id);
      const activeHostCount = activeHostRows.filter((row) => row.role === "host").length +
        (activeHostRows.some((row) => row.user_id === context.club.created_by) ? 0 : 1);

      if (activeHostCount <= 1) {
        throw new MembershipError(400, "Klub musi mieć przynajmniej jednego prowadzącego.");
      }
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("club_members")
      .update({ membership_status: "left" })
      .eq("club_id", context.club.id)
      .eq("user_id", context.user.id)
      .select("id, club_id, user_id, role, display_name, membership_status, joined_at, updated_at")
      .single();

    if (error || !data) {
      throw new MembershipError(400, "Nie udało się opuścić klubu.");
    }

    return buildMembershipSuccessResult(
      context,
      buildMembershipView(context.club, data as ClubMemberRow, context.user),
      "Opuściłeś klub.",
    );
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function renameMembership(
  clubId: string,
  displayName: string,
  accessToken: string,
): Promise<MembershipActionResult> {
  try {
    const validationError = validateMemberDisplayName(displayName);

    if (validationError) {
      throw new MembershipError(400, validationError);
    }

    const normalizedDisplayName = normalizeMemberDisplayName(displayName);
    const context = await loadMembershipContext(clubId, accessToken);

    if (context.isCreator && !context.memberRow) {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("club_members")
        .upsert(
          {
            club_id: context.club.id,
            user_id: context.user.id,
            role: "host",
            membership_status: "active",
            display_name: normalizedDisplayName,
          },
          {
            onConflict: "club_id,user_id",
          },
        )
        .select("id, club_id, user_id, role, display_name, membership_status, joined_at, updated_at")
        .single();

      if (error || !data) {
        throw new MembershipError(400, "Nie udało się zmienić nazwy członka.");
      }

      return buildMembershipSuccessResult(
        context,
        buildMembershipView(context.club, data as ClubMemberRow, context.user),
        "Nazwa członka została zaktualizowana.",
      );
    }

    if (!context.memberRow) {
      throw new MembershipError(404, "Nie znaleziono członkostwa do edycji.");
    }

    if (context.memberRow.membership_status === "left") {
      throw new MembershipError(400, "Nie można zmienić nazwy zakończonego członkostwa.");
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("club_members")
      .update({ display_name: normalizedDisplayName })
      .eq("club_id", context.club.id)
      .eq("user_id", context.user.id)
      .select("id, club_id, user_id, role, display_name, membership_status, joined_at, updated_at")
      .single();

    if (error || !data) {
      throw new MembershipError(400, "Nie udało się zmienić nazwy członka.");
    }

    return buildMembershipSuccessResult(
      context,
      buildMembershipView(context.club, data as ClubMemberRow, context.user),
      "Nazwa członka została zaktualizowana.",
    );
  } catch (error) {
    return toErrorResult(error);
  }
}

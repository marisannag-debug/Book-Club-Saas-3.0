import { createClient } from "@supabase/supabase-js";
import type { ClubRole, ClubRoleMember, ClubRolesViewModel } from "../../app/components/club/roles";
import { getSupabaseServerClient } from "../supabase.server";
import type { SupabaseDatabase } from "../supabase.types";

export type { ClubRole } from "../../app/components/club/roles";
export type MembershipStatus = "pending" | "active" | "left";

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
  display_name?: string | null;
  role: ClubRole | null;
  membership_status?: MembershipStatus | null;
  joined_at: string;
};

type AuthenticatedUser = {
  id: string;
  email?: string | null;
};

export type ClubRolesResult =
  | {
      ok: true;
      status: 200;
      club: ClubRolesViewModel;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

export type UpdateClubMemberRoleResult =
  | {
      ok: true;
      status: 200;
      message: string;
      member: ClubRoleMember;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

class ClubRoleError extends Error {
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

export function validateClubRole(role: unknown): ClubRole | null {
  return role === "host" || role === "member" ? role : null;
}

function normalizeClubId(clubId: string) {
  return clubId.trim();
}

export function formatMemberName(userId: string) {
  return userId.slice(0, 8);
}

function mapMemberRow(row: ClubMemberRow, currentUser: AuthenticatedUser, creatorId: string): ClubRoleMember {
  const isCurrentUser = row.user_id === currentUser.id;
  const isCreator = row.user_id === creatorId;
  const email = isCurrentUser ? currentUser.email ?? null : null;
  const displayName = row.display_name?.trim() || formatMemberName(row.user_id);

  return {
    userId: row.user_id,
    email,
    displayName,
    role: isCreator ? "host" : row.role ?? "member",
    joinedAt: row.joined_at,
    isCurrentUser,
    isCreator,
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

async function listClubMemberRows(clubId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("club_members")
    .select("id, club_id, user_id, display_name, role, membership_status, joined_at")
    .eq("club_id", clubId)
    .order("joined_at", { ascending: true });

  if (error || !data) {
    throw new ClubRoleError(400, "Nie udało się wczytać listy członków klubu.");
  }

  return (data as ClubMemberRow[]).filter(
    (member) => member.membership_status !== "left" && member.membership_status !== "pending",
  );
}

function getRoleForUser(club: ClubRow, members: ClubMemberRow[], userId: string): ClubRole | null {
  if (club.created_by === userId) {
    return "host";
  }

  const membership = members.find((member) => member.user_id === userId);

  if (!membership) {
    return null;
  }

  if (membership.membership_status && membership.membership_status !== "active") {
    return null;
  }

  return membership.role ?? "member";
}

function ensureCreatorInMembers(club: ClubRow, members: ClubMemberRow[]): ClubMemberRow[] {
  if (members.some((member) => member.user_id === club.created_by)) {
    return members;
  }

  return [
    {
      id: `creator-${club.created_by}`,
      club_id: club.id,
      user_id: club.created_by,
      display_name: null,
      role: "host",
      membership_status: "active",
      joined_at: club.created_at ?? new Date(0).toISOString(),
    },
    ...members,
  ];
}

async function requireAuthenticatedUser(accessToken: string) {
  const user = await getAuthenticatedUser(accessToken);

  if (!user) {
    throw new ClubRoleError(401, "Nie masz aktywnej sesji. Zaloguj się ponownie i spróbuj jeszcze raz.");
  }

  return user;
}

async function loadClubRoleContext(clubId: string, accessToken: string) {
  const normalizedClubId = normalizeClubId(clubId);

  if (!normalizedClubId) {
    throw new ClubRoleError(400, "Brakuje identyfikatora klubu.");
  }

  const user = await requireAuthenticatedUser(accessToken);
  const club = await findClubById(normalizedClubId);

  if (!club) {
    throw new ClubRoleError(404, "Nie znaleziono klubu.");
  }

  const members = await listClubMemberRows(club.id);
  const currentUserRole = getRoleForUser(club, members, user.id);

  if (!currentUserRole) {
    throw new ClubRoleError(403, "Nie masz dostępu do członków tego klubu.");
  }

  return {
    user,
    club,
    members,
    currentUserRole,
  };
}

function toErrorResult(error: unknown) {
  if (error instanceof ClubRoleError) {
    return {
      ok: false as const,
      status: error.status,
      message: error.message,
    };
  }

  return {
    ok: false as const,
    status: 500,
    message: "Nie udało się przetworzyć ról klubu. Spróbuj ponownie.",
  };
}

export async function getCurrentUserClubRole(clubId: string, accessToken: string): Promise<ClubRole | null> {
  try {
    const context = await loadClubRoleContext(clubId, accessToken);
    return context.currentUserRole;
  } catch {
    return null;
  }
}

export async function assertClubHost(clubId: string, accessToken: string) {
  const context = await loadClubRoleContext(clubId, accessToken);

  if (context.currentUserRole !== "host") {
    throw new ClubRoleError(403, "Tylko prowadzący może zarządzać rolami członków.");
  }

  return context;
}

export async function listClubMembersWithRoles(clubId: string, accessToken: string): Promise<ClubRolesResult> {
  try {
    const context = await loadClubRoleContext(clubId, accessToken);
    const membersWithCreator = ensureCreatorInMembers(context.club, context.members);

    return {
      ok: true,
      status: 200,
      club: {
        clubId: context.club.id,
        clubName: context.club.name,
        currentUserRole: context.currentUserRole,
        members: membersWithCreator.map((member) => mapMemberRow(member, context.user, context.club.created_by)),
      },
    };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function updateClubMemberRole({
  clubId,
  memberUserId,
  role,
  accessToken,
}: {
  clubId: string;
  memberUserId: string;
  role: unknown;
  accessToken: string;
}): Promise<UpdateClubMemberRoleResult> {
  try {
    const normalizedRole = validateClubRole(role);
    const normalizedMemberUserId = memberUserId.trim();

    if (!normalizedRole) {
      throw new ClubRoleError(400, "Nieprawidłowa rola członka.");
    }

    if (!normalizedMemberUserId) {
      throw new ClubRoleError(400, "Brakuje identyfikatora członka.");
    }

    const context = await assertClubHost(clubId, accessToken);

    if (context.club.created_by === normalizedMemberUserId) {
      throw new ClubRoleError(400, "Twórca klubu zawsze pozostaje prowadzącym.");
    }

    const targetMember = context.members.find((member) => member.user_id === normalizedMemberUserId);

    if (!targetMember) {
      throw new ClubRoleError(404, "Nie znaleziono członka w tym klubie.");
    }

    const currentHostCount = context.members.filter((member) => member.role === "host").length + 1;

    if ((targetMember.role ?? "member") === "host" && normalizedRole === "member" && currentHostCount <= 1) {
      throw new ClubRoleError(400, "Klub musi mieć przynajmniej jednego prowadzącego.");
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("club_members")
      .update({ role: normalizedRole })
      .eq("club_id", context.club.id)
      .eq("user_id", normalizedMemberUserId)
      .select("id, club_id, user_id, role, joined_at")
      .single();

    if (error || !data) {
      throw new ClubRoleError(400, "Nie udało się zmienić roli członka.");
    }

    return {
      ok: true,
      status: 200,
      message: "Rola członka została zaktualizowana.",
      member: mapMemberRow(data as ClubMemberRow, context.user, context.club.created_by),
    };
  } catch (error) {
    return toErrorResult(error);
  }
}

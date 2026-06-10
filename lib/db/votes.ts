import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "../supabase.server";
import type { SupabaseDatabase } from "../supabase.types";
import { voteProposalSchema, type ProposalVoteSummary } from "../voting";

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
};

type VoteRow = {
  proposal_id: string;
  user_id: string;
};

type AuthenticatedUser = {
  id: string;
  email?: string | null;
};

class VoteError extends Error {
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

function toErrorResult(error: unknown) {
  if (error instanceof VoteError) {
    return {
      ok: false as const,
      status: error.status,
      message: error.message,
    };
  }

  return {
    ok: false as const,
    status: 500,
    message: "Nie udało się przetworzyć głosu. Spróbuj ponownie.",
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
    throw new VoteError(401, "Nie masz aktywnej sesji. Zaloguj się ponownie i spróbuj jeszcze raz.");
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
    throw new VoteError(400, "Nie udało się odczytać członków klubu.");
  }

  return (data as ClubMemberRow[]).filter((member) => member.membership_status !== "left" && member.membership_status !== "pending");
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
  const normalizedClubId = clubId.trim();

  if (!normalizedClubId) {
    throw new VoteError(400, "Brakuje identyfikatora klubu.");
  }

  const user = await requireAuthenticatedUser(accessToken);
  const club = await findClubById(normalizedClubId);

  if (!club) {
    throw new VoteError(404, "Nie znaleziono klubu.");
  }

  const members = await listActiveClubMembers(club.id);
  const currentUserRole = getCurrentUserRole(club, members, user.id);

  if (!currentUserRole) {
    throw new VoteError(403, "Nie masz dostępu do głosowania w tym klubie.");
  }

  return {
    user,
    club,
    currentUserRole,
  };
}

async function loadProposalById(proposalId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("book_proposals").select("id, club_id").eq("id", proposalId).maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as BookProposalRow;
}

export async function getProposalVoteSummaries(proposalIds: string[], currentUserId: string) {
  const normalizedProposalIds = proposalIds.map((proposalId) => proposalId.trim()).filter(Boolean);

  if (normalizedProposalIds.length === 0) {
    return new Map<string, ProposalVoteSummary>();
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("votes")
    .select("proposal_id, user_id")
    .in("proposal_id", normalizedProposalIds);

  if (error || !data) {
    throw new VoteError(400, "Nie udało się odczytać głosów.");
  }

  const summaryByProposalId = new Map<string, ProposalVoteSummary>();

  for (const proposalId of normalizedProposalIds) {
    summaryByProposalId.set(proposalId, {
      votesCount: 0,
      currentUserHasVoted: false,
    });
  }

  for (const row of data as VoteRow[]) {
    const nextSummary = summaryByProposalId.get(row.proposal_id) ?? {
      votesCount: 0,
      currentUserHasVoted: false,
    };

    nextSummary.votesCount += 1;
    nextSummary.currentUserHasVoted = nextSummary.currentUserHasVoted || row.user_id === currentUserId;
    summaryByProposalId.set(row.proposal_id, nextSummary);
  }

  return summaryByProposalId;
}

export type VoteMutationResult =
  | {
      ok: true;
      status: 201 | 200;
      message: string;
      proposalId: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

export async function createProposalVote(proposalId: string, accessToken: string): Promise<VoteMutationResult> {
  try {
    const parsed = voteProposalSchema.safeParse({ proposalId });

    if (!parsed.success) {
      throw new VoteError(400, parsed.error.issues[0]?.message ?? "Nieprawidłowy identyfikator propozycji.");
    }

    const proposal = await loadProposalById(parsed.data.proposalId);

    if (!proposal) {
      throw new VoteError(404, "Nie znaleziono propozycji książki.");
    }

    const access = await loadClubAccess(proposal.club_id, accessToken);
    const supabase = getSupabaseServerClient();

    const { error } = await supabase.from("votes").insert({
      proposal_id: proposal.id,
      user_id: access.user.id,
    });

    if (error) {
      if ((error as { code?: string }).code === "23505") {
        throw new VoteError(409, "Masz już głos na tę propozycję.");
      }

      throw new VoteError(400, "Nie udało się zapisać głosu.");
    }

    return {
      ok: true,
      status: 201,
      message: "Głos został zapisany.",
      proposalId: proposal.id,
    };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function deleteProposalVote(proposalId: string, accessToken: string): Promise<VoteMutationResult> {
  try {
    const parsed = voteProposalSchema.safeParse({ proposalId });

    if (!parsed.success) {
      throw new VoteError(400, parsed.error.issues[0]?.message ?? "Nieprawidłowy identyfikator propozycji.");
    }

    const proposal = await loadProposalById(parsed.data.proposalId);

    if (!proposal) {
      throw new VoteError(404, "Nie znaleziono propozycji książki.");
    }

    const access = await loadClubAccess(proposal.club_id, accessToken);
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("votes")
      .delete()
      .eq("proposal_id", proposal.id)
      .eq("user_id", access.user.id)
      .select("proposal_id")
      .maybeSingle();

    if (error) {
      throw new VoteError(400, "Nie udało się usunąć głosu.");
    }

    if (!data) {
      throw new VoteError(404, "Nie znaleziono głosu do usunięcia.");
    }

    return {
      ok: true,
      status: 200,
      message: "Głos został usunięty.",
      proposalId: proposal.id,
    };
  } catch (error) {
    return toErrorResult(error);
  }
}
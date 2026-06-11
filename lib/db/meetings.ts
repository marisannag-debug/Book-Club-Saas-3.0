import { createClient } from "@supabase/supabase-js";
import type { MeetingPoll, MeetingPollSlot } from "../../app/components/meetings/types";
import { getSupabaseServerClient } from "../supabase.server";
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

class MeetingError extends Error {
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

function getSupabaseQueryClient(accessToken?: string) {
  if (accessToken && accessToken.trim()) {
    return createRequestSupabaseClient(accessToken);
  }

  return getSupabaseServerClient();
}

async function getAuthenticatedUser(accessToken: string) {
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
    throw new MeetingError(401, "Nie masz aktywnej sesji. Zaloguj się ponownie i spróbuj jeszcze raz.");
  }

  return user;
}

async function findMeetingById(meetingId: string, accessToken?: string): Promise<ClubMeetingRow | null> {
  const supabase = getSupabaseQueryClient(accessToken);
  const { data, error } = await supabase
    .from("club_meetings")
    .select("id, club_id, title, description, status, finalized_slot_id, created_by, created_at, updated_at")
    .eq("id", meetingId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ClubMeetingRow;
}

async function isUserMemberOfClub(clubId: string, userId: string, accessToken?: string) {
  const supabase = getSupabaseQueryClient(accessToken);
  const { data, error } = await supabase.from("club_members").select("user_id").eq("club_id", clubId).eq("user_id", userId).maybeSingle();

  if (error) {
    throw new MeetingError(400, "Nie udało się sprawdzić członkostwa klubu.");
  }

  return !!data;
}

type ClubRow = {
  id: string;
  name: string;
  created_by: string;
};

type ClubMeetingRow = {
  id: string;
  club_id: string;
  title: string;
  description: string | null;
  status: "draft" | "open" | "closed" | "finalized";
  finalized_slot_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type ClubMeetingSlotRow = {
  id: string;
  meeting_id: string;
  start_at: string;
  end_at: string | null;
  label: string | null;
  created_by: string;
};

type ClubMeetingSlotVoteRow = {
  slot_id: string;
  meeting_id: string;
  user_id: string;
};

function formatPlannerDateLabel(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatPlannerTimeLabel(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toMeetingPollSlot(slot: ClubMeetingSlotRow, votesBySlot: Map<string, { votesCount: number; currentUserHasVoted: boolean }>): MeetingPollSlot {
  const meta = votesBySlot.get(slot.id) ?? { votesCount: 0, currentUserHasVoted: false };

  return {
    id: slot.id,
    label: slot.label ?? "Proponowany termin",
    startLabel: `${formatPlannerDateLabel(slot.start_at)} • ${formatPlannerTimeLabel(slot.start_at)}`,
    endLabel: slot.end_at
      ? `${formatPlannerDateLabel(slot.end_at)} • ${formatPlannerTimeLabel(slot.end_at)}`
      : "Brak czasu zakończenia",
    votesCount: meta.votesCount,
    currentUserHasVoted: meta.currentUserHasVoted,
    createdByIsCurrentUser: false,
    createdByLabel: "Prowadzący",
  };
}

async function loadMeetingPollById(
  meetingId: string,
  clubName: string,
  currentUserId?: string,
  accessToken?: string,
): Promise<MeetingPoll | null> {
  const supabase = getSupabaseQueryClient(accessToken);
  const { data: meeting, error: meetingError } = await supabase
    .from("club_meetings")
    .select("id, club_id, title, description, status, finalized_slot_id, created_by, created_at, updated_at")
    .eq("id", meetingId)
    .maybeSingle();

  if (meetingError || !meeting) {
    return null;
  }

  const effectiveCurrentUserId =
    currentUserId ??
    (accessToken
      ? (await getAuthenticatedUser(accessToken))?.id ?? undefined
      : undefined);

  const { data: slotsData, error: slotsError } = await supabase
    .from("club_meeting_slots")
    .select("id, meeting_id, start_at, end_at, label, created_by")
    .eq("meeting_id", meetingId)
    .order("start_at", { ascending: true });

  if (slotsError) {
    throw new MeetingError(400, "Nie udało się odczytać propozycji terminów.");
  }

  const slotIds = (slotsData as ClubMeetingSlotRow[]).map((slot) => slot.id);
  const { data: votesData, error: votesError } = await supabase
    .from("club_meeting_slot_votes")
    .select("slot_id, meeting_id, user_id")
    .eq("meeting_id", meetingId);

  if (votesError) {
    throw new MeetingError(400, "Nie udało się odczytać głosów.");
  }

  const votesBySlot = new Map<string, { votesCount: number; currentUserHasVoted: boolean }>();
  for (const slotId of slotIds) {
    votesBySlot.set(slotId, { votesCount: 0, currentUserHasVoted: false });
  }

  for (const vote of votesData as ClubMeetingSlotVoteRow[]) {
    const next = votesBySlot.get(vote.slot_id) ?? { votesCount: 0, currentUserHasVoted: false };
    next.votesCount += 1;
    if (effectiveCurrentUserId && vote.user_id === effectiveCurrentUserId) {
      next.currentUserHasVoted = true;
    }
    votesBySlot.set(vote.slot_id, next);
  }

  const slots = (slotsData as ClubMeetingSlotRow[]).map((slot) => toMeetingPollSlot(slot, votesBySlot));

  return {
    id: meeting.id,
    clubId: meeting.club_id,
    clubName,
    title: meeting.title,
    description: meeting.description ?? "",
    status: meeting.status,
    createdAtLabel: formatPlannerDateLabel(meeting.created_at),
    updatedAtLabel: formatPlannerDateLabel(meeting.updated_at),
    createdByLabel: meeting.created_by ? "Prowadzący" : "Prowadzący",
    finalizedSlotId: meeting.finalized_slot_id,
    currentUserRole: "host",
    currentUserVoteSlotId: effectiveCurrentUserId ? slots.find((slot) => slot.currentUserHasVoted)?.id ?? null : null,
    slots,
  };
}

export async function ensurePlannerMeetingForClub(clubId: string, accessToken?: string) {
  const normalizedClubId = clubId.trim();

  if (!normalizedClubId) {
    throw new MeetingError(400, "Brakuje identyfikatora klubu.");
  }

  const supabase = getSupabaseQueryClient(accessToken);
  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select("id, name, created_by")
    .eq("id", normalizedClubId)
    .maybeSingle();

  if (clubError || !club) {
    throw new MeetingError(404, "Nie znaleziono klubu.");
  }

  const clubData = club as ClubRow;

  const { data: existingMeetings, error: meetingError } = await supabase
    .from("club_meetings")
    .select("id, status")
    .eq("club_id", normalizedClubId)
    .in("status", ["draft", "open"])
    .order("created_at", { ascending: false })
    .limit(1);

  if (meetingError) {
    throw new MeetingError(400, "Nie udało się odczytać planera spotkania.");
  }

  const existingMeeting = existingMeetings?.[0] ?? null;

  if (existingMeeting) {
    if (existingMeeting.status !== "open") {
      const { error: updateError } = await supabase
        .from("club_meetings")
        .update({ status: "open" })
        .eq("id", existingMeeting.id);

      if (updateError) {
        throw new MeetingError(400, "Nie udało się aktywować planera spotkania.");
      }
    }

    const meeting = await loadMeetingPollById(existingMeeting.id, clubData.name, undefined, accessToken);
    if (!meeting) {
      throw new MeetingError(404, "Nie znaleziono planera spotkania.");
    }

    return meeting;
  }

  const { data: insertedMeeting, error: insertError } = await supabase
    .from("club_meetings")
    .insert([
      {
        club_id: normalizedClubId,
        title: `${clubData.name} - planer spotkania`,
        description: "Dodawaj propozycje pojedynczo i głosuj na najlepszy termin bez opuszczania tej podstrony.",
        created_by: clubData.created_by,
        status: "open",
        finalized_slot_id: null,
        finalized_at: null,
      },
    ])
    .select("id")
    .maybeSingle();

  if (insertError || !insertedMeeting) {
    throw new MeetingError(400, "Nie udało się utworzyć planera spotkania.");
  }

  const meeting = await loadMeetingPollById((insertedMeeting as { id: string }).id, clubData.name, undefined, accessToken);
  if (!meeting) {
    throw new MeetingError(404, "Nie znaleziono nowo utworzonego planera spotkania.");
  }

  return meeting;
}

export async function createMeetingSlot(
  meetingId: string,
  startAt: string,
  endAt: string | null,
  label: string | null,
  accessToken: string,
) {
  try {
    const user = await requireAuthenticatedUser(accessToken);

    const meeting = await findMeetingById(meetingId, accessToken);

    if (!meeting) {
      throw new MeetingError(404, "Nie znaleziono ankiety spotkania.");
    }

    // membership check: user must be club member or meeting creator
    const isMember = await isUserMemberOfClub(meeting.club_id, user.id, accessToken);

    if (!isMember && meeting.created_by !== user.id) {
      throw new MeetingError(403, "Nie masz uprawnień do dodawania propozycji do tej ankiety.");
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase.from("club_meeting_slots").insert([
      {
        meeting_id: meetingId,
        start_at: startAt,
        end_at: endAt,
        label,
        created_by: user.id,
      },
    ]).select("id").maybeSingle();

    if (error || !data) {
      throw new MeetingError(400, "Nie udało się zapisać propozycji terminu.");
    }

    const insertedSlot = data as { id: string };

    return { ok: true as const, slotId: insertedSlot.id };
  } catch (error) {
    if (error instanceof MeetingError) {
      return { ok: false as const, status: error.status, message: error.message };
    }

    return { ok: false as const, status: 500, message: "Nieoczekiwany błąd serwera." };
  }
}

export async function deleteMeetingSlot(slotId: string, accessToken: string) {
  try {
    const user = await requireAuthenticatedUser(accessToken);

    const supabase = getSupabaseServerClient();

    const { data: slotData, error: slotErr } = await supabase.from("club_meeting_slots").select("id, meeting_id, created_by").eq("id", slotId).maybeSingle();

    if (slotErr || !slotData) {
      throw new MeetingError(404, "Nie znaleziono propozycji terminu.");
    }

    const meeting = await findMeetingById(slotData.meeting_id, accessToken);

    if (!meeting) {
      throw new MeetingError(404, "Nie znaleziono ankiety powiązanej z propozycją.");
    }

    // allow delete only for slot author or club owner
    const club = await supabase.from("clubs").select("id, created_by").eq("id", meeting.club_id).maybeSingle();

    if (club.error || !club.data) {
      throw new MeetingError(400, "Nie udało się odczytać danych klubu.");
    }

    const isAuthor = slotData.created_by === user.id;
    const clubData = club.data as { created_by: string };
    const isClubOwner = clubData.created_by === user.id;

    if (!isAuthor && !isClubOwner) {
      throw new MeetingError(403, "Nie masz uprawnień do usunięcia tej propozycji.");
    }

    const { error: delErr } = await supabase.from("club_meeting_slots").delete().eq("id", slotId);

    if (delErr) {
      throw new MeetingError(400, "Nie udało się usunąć propozycji.");
    }

    return { ok: true as const, message: "Propozycja została usunięta." };
  } catch (error) {
    if (error instanceof MeetingError) {
      return { ok: false as const, status: error.status, message: error.message };
    }

    return { ok: false as const, status: 500, message: "Nieoczekiwany błąd serwera." };
  }
}

export async function listMeetingsForClub(clubId: string, currentUserId?: string) {
  const supabase = getSupabaseServerClient();

  const { data: meetings, error } = await supabase.from("club_meetings").select("id, title, description, status, finalized_slot_id, created_by").eq("club_id", clubId).order("created_at", { ascending: false });

  if (error) {
    throw new MeetingError(400, "Nie udało się odczytać ankiet.");
  }

  const meetingRows = meetings as ClubMeetingRow[];
  const meetingIds = meetingRows.map((meeting) => meeting.id);

  if (meetingIds.length === 0) {
    return [];
  }

  const { data: slotsData, error: slotsError } = await supabase.from("club_meeting_slots").select("id, meeting_id, start_at, end_at, label, created_by").in("meeting_id", meetingIds).order("start_at", { ascending: true });

  if (slotsError) {
    throw new MeetingError(400, "Nie udało się odczytać propozycji terminów.");
  }

  const slotRows = slotsData as ClubMeetingSlotRow[];
  const slotIds = slotRows.map((slot) => slot.id);

  const { data: votesData, error: votesError } = await supabase.from("club_meeting_slot_votes").select("slot_id, meeting_id, user_id").in("meeting_id", meetingIds);

  if (votesError) {
    throw new MeetingError(400, "Nie udało się odczytać głosów.");
  }

  const votesBySlot = new Map<string, { votesCount: number; currentUserHasVoted: boolean }>();

  for (const s of slotIds) {
    votesBySlot.set(s, { votesCount: 0, currentUserHasVoted: false });
  }

  const voteRows = votesData as ClubMeetingSlotVoteRow[];

  for (const vote of voteRows) {
    const next = votesBySlot.get(vote.slot_id) ?? { votesCount: 0, currentUserHasVoted: false };
    next.votesCount += 1;
    if (currentUserId && vote.user_id === currentUserId) next.currentUserHasVoted = true;
    votesBySlot.set(vote.slot_id, next);
  }

  const slotsByMeeting = new Map<string, Array<{
    id: string;
    meetingId: string;
    startAt: string;
    endAt: string | null;
    label: string | null;
    createdById: string;
    votesCount: number;
    currentUserHasVoted: boolean;
  }>>();

  for (const slot of slotRows) {
    const meta = votesBySlot.get(slot.id) ?? { votesCount: 0, currentUserHasVoted: false };
    const enriched = {
      id: slot.id,
      meetingId: slot.meeting_id,
      startAt: slot.start_at,
      endAt: slot.end_at,
      label: slot.label,
      createdById: slot.created_by,
      votesCount: meta.votesCount,
      currentUserHasVoted: meta.currentUserHasVoted,
    };

    const arr = slotsByMeeting.get(slot.meeting_id) ?? [];
    arr.push(enriched);
    slotsByMeeting.set(slot.meeting_id, arr);
  }

  return meetingRows.map((meeting) => ({
    id: meeting.id,
    title: meeting.title,
    description: meeting.description,
    status: meeting.status,
    finalizedSlotId: meeting.finalized_slot_id,
    createdBy: meeting.created_by,
    slots: slotsByMeeting.get(meeting.id) ?? [],
  }));
}

export type VoteMutationResult =
  | {
      ok: true;
      status: 201 | 200;
      message?: string;
      meetingId?: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

export async function createMeetingVote(meetingId: string, slotId: string, accessToken: string): Promise<VoteMutationResult> {
  try {
    const user = await requireAuthenticatedUser(accessToken);

    const meeting = await findMeetingById(meetingId, accessToken);

    if (!meeting) {
      throw new MeetingError(404, "Nie znaleziono ankiety spotkania.");
    }

    if (meeting.status !== "open") {
      throw new MeetingError(400, "Ankieta nie jest otwarta na głosowanie.");
    }

    const supabase = getSupabaseServerClient();

    const { error } = await supabase.from("club_meeting_slot_votes").insert({
      meeting_id: meetingId,
      slot_id: slotId,
      user_id: user.id,
    });

    if (error) {
      if ((error as { code?: string }).code === "23505") {
        throw new MeetingError(409, "Masz już głos w tej ankiecie.");
      }

      throw new MeetingError(400, "Nie udało się zapisać głosu.");
    }

    return { ok: true, status: 201, message: "Głos został zapisany.", meetingId };
  } catch (error) {
    if (error instanceof MeetingError) {
      return { ok: false, status: error.status, message: error.message };
    }

    return { ok: false, status: 500, message: "Nieoczekiwany błąd serwera." };
  }
}

export async function deleteMeetingVote(meetingId: string, accessToken: string): Promise<VoteMutationResult> {
  try {
    const user = await requireAuthenticatedUser(accessToken);

    const meeting = await findMeetingById(meetingId, accessToken);

    if (!meeting) {
      throw new MeetingError(404, "Nie znaleziono ankiety spotkania.");
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("club_meeting_slot_votes")
      .delete()
      .eq("meeting_id", meetingId)
      .eq("user_id", user.id)
      .select("slot_id")
      .maybeSingle();

    if (error) {
      throw new MeetingError(400, "Nie udało się usunąć głosu.");
    }

    if (!data) {
      throw new MeetingError(404, "Nie znaleziono głosu do usunięcia.");
    }

    return { ok: true, status: 200, message: "Głos został usunięty.", meetingId };
  } catch (error) {
    if (error instanceof MeetingError) {
      return { ok: false, status: error.status, message: error.message };
    }

    return { ok: false, status: 500, message: "Nieoczekiwany błąd serwera." };
  }
}

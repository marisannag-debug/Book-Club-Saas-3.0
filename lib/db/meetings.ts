import { createClient } from "@supabase/supabase-js";
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

async function findMeetingById(meetingId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("club_meetings").select("id, club_id, title, description, status, finalized_slot_id").eq("id", meetingId).maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as any;
}

async function isUserMemberOfClub(clubId: string, userId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("club_members").select("user_id").eq("club_id", clubId).eq("user_id", userId).maybeSingle();

  if (error) {
    throw new MeetingError(400, "Nie udało się sprawdzić członkostwa klubu.");
  }

  return !!data;
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

    const meeting = await findMeetingById(meetingId);

    if (!meeting) {
      throw new MeetingError(404, "Nie znaleziono ankiety spotkania.");
    }

    // membership check: user must be club member or meeting creator
    const isMember = await isUserMemberOfClub(meeting.club_id, user.id);

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

    if (error) {
      throw new MeetingError(400, "Nie udało się zapisać propozycji terminu.");
    }

    return { ok: true as const, slotId: (data as any).id };
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

    const meeting = await findMeetingById(slotData.meeting_id);

    if (!meeting) {
      throw new MeetingError(404, "Nie znaleziono ankiety powiązanej z propozycją.");
    }

    // allow delete only for slot author or club owner
    const club = await supabase.from("clubs").select("id, created_by").eq("id", meeting.club_id).maybeSingle();

    if (club.error || !club.data) {
      throw new MeetingError(400, "Nie udało się odczytać danych klubu.");
    }

    const isAuthor = slotData.created_by === user.id;
    const isClubOwner = (club.data as any).created_by === user.id;

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

  const meetingIds = (meetings as any[]).map((m) => m.id);

  if (meetingIds.length === 0) {
    return [];
  }

  const { data: slotsData, error: slotsError } = await supabase.from("club_meeting_slots").select("id, meeting_id, start_at, end_at, label, created_by").in("meeting_id", meetingIds).order("start_at", { ascending: true });

  if (slotsError) {
    throw new MeetingError(400, "Nie udało się odczytać propozycji terminów.");
  }

  const slotIds = (slotsData as any[]).map((s) => s.id);

  const { data: votesData, error: votesError } = await supabase.from("club_meeting_slot_votes").select("slot_id, meeting_id, user_id").in("meeting_id", meetingIds);

  if (votesError) {
    throw new MeetingError(400, "Nie udało się odczytać głosów.");
  }

  const votesBySlot = new Map<string, { votesCount: number; currentUserHasVoted: boolean }>();

  for (const s of slotIds) {
    votesBySlot.set(s, { votesCount: 0, currentUserHasVoted: false });
  }

  for (const v of votesData as any[]) {
    const next = votesBySlot.get(v.slot_id) ?? { votesCount: 0, currentUserHasVoted: false };
    next.votesCount += 1;
    if (currentUserId && v.user_id === currentUserId) next.currentUserHasVoted = true;
    votesBySlot.set(v.slot_id, next);
  }

  const slotsByMeeting = new Map<string, any[]>();

  for (const s of slotsData as any[]) {
    const meta = votesBySlot.get(s.id) ?? { votesCount: 0, currentUserHasVoted: false };
    const enriched = {
      id: s.id,
      meetingId: s.meeting_id,
      startAt: s.start_at,
      endAt: s.end_at,
      label: s.label,
      createdById: s.created_by,
      votesCount: meta.votesCount,
      currentUserHasVoted: meta.currentUserHasVoted,
    };

    const arr = slotsByMeeting.get(s.meeting_id) ?? [];
    arr.push(enriched);
    slotsByMeeting.set(s.meeting_id, arr);
  }

  return (meetings as any[]).map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    status: m.status,
    finalizedSlotId: m.finalized_slot_id,
    createdBy: m.created_by,
    slots: slotsByMeeting.get(m.id) ?? [],
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

    const meeting = await findMeetingById(meetingId);

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

    const meeting = await findMeetingById(meetingId);

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

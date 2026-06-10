import type {
  ClubDashboardInvite,
  ClubDashboardMeeting,
  ClubDashboardModel,
  ClubDashboardVoting,
} from "../app/components/ClubDashboard/types";
import { getSupabaseServerClient } from "./supabase.server";

function titleizeId(id: string) {
  return id
    .replace(/[-_]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildDemoVoting(): ClubDashboardVoting {
  return {
    title: "Wybór książki na najbliższy miesiąc",
    status: "Aktywne",
    deadline: "Do końca tygodnia",
    proposalsCount: 4,
    summary: "Członkowie mogą jeszcze dopisać propozycje i zagłosować na faworyta.",
  };
}

function buildDemoMeeting(): ClubDashboardMeeting {
  return {
    id: "demo-meeting",
    title: "Nadchodzące spotkanie",
    date: "24 maja 2026",
    time: "18:30",
    venue: "Biblioteka miejska, sala 2",
    summary: "Podgląd najbliższego spotkania, który później rozszerzymy o pełny scheduler.",
    finalized: true,
  };
}

function buildDemoInvite(id: string, isEmptyState: boolean): ClubDashboardInvite {
  return {
    code: `${id.slice(0, 4).toUpperCase() || "BOOK"}-${Math.max(100, id.length * 17)}`,
    hint: isEmptyState
      ? "W stage 10 dodamy zaproszenia linkiem"
      : "Wygeneruj link lub kod zaproszenia i przekaż go osobie, która ma dołączyć do klubu.",
    status: isEmptyState ? "Brak zaproszeń" : "Aktywne zaproszenia",
  };
}

type ClubMemberCountRow = {
  user_id: string;
  membership_status?: "pending" | "active" | "left" | null;
};

function buildFallbackClubDashboard(id: string): ClubDashboardModel {
  const normalizedId = id.trim();
  const isEmptyState = /empty|pusty|placeholder|no-club/i.test(normalizedId);
  const readableName = titleizeId(normalizedId);

  return {
    id: normalizedId,
    name: readableName || "Mój klub",
    description: isEmptyState
      ? "To jest pusty wariant demonstracyjny. Sekcje pokazują stany startowe dla nowego klubu."
      : "To jest startowy panel klubu z najważniejszymi skrótami do głosowania, spotkań i zaproszeń.",
    memberCount: isEmptyState ? 0 : Math.max(6, normalizedId.length + 4),
    activeVoting: isEmptyState ? null : buildDemoVoting(),
    nextMeeting: isEmptyState ? null : buildDemoMeeting(),
    invite: buildDemoInvite(normalizedId, isEmptyState),
  };
}

export function buildClubDashboardFallback(id: string) {
  return buildFallbackClubDashboard(id);
}

export async function getClubDashboardById(id: string): Promise<ClubDashboardModel> {
  const normalizedId = id.trim();

  if (!normalizedId) {
    throw new Error("Brakuje identyfikatora klubu.");
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("clubs")
      .select("id, name, description, created_by")
      .eq("id", normalizedId)
      .maybeSingle();

    if (!error && data) {
      const fallback = buildFallbackClubDashboard(normalizedId);
      const memberCount = await getRealClubMemberCount(data.id, data.created_by);
      const proposalsCount = await getRealProposalsCount(data.id);

      const activeVoting = fallback.activeVoting;
      if (activeVoting && proposalsCount !== null) {
        activeVoting.proposalsCount = proposalsCount;
      }

        // determine next meeting: prefer finalized meeting, else an open meeting (voting ongoing)
        let nextMeeting = null;

        try {
          // try to find latest finalized meeting
          const { data: finalized, error: finErr } = await supabase
            .from("club_meetings")
            .select("id, title, finalized_slot_id, finalized_at")
            .eq("club_id", data.id)
            .eq("status", "finalized")
            .order("finalized_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!finErr && finalized) {
            // fetch slot details
            const { data: slot, error: slotErr } = await supabase
              .from("club_meeting_slots")
              .select("start_at, end_at, label")
              .eq("id", finalized.finalized_slot_id)
              .maybeSingle();

            if (!slot || slotErr) {
              nextMeeting = {
                id: finalized.id,
                title: finalized.title ?? "Nadchodzące spotkanie",
                date: new Date(finalized.finalized_at ?? new Date()).toLocaleDateString("pl-PL", { day: "2-digit", month: "long", year: "numeric" }),
                time: slot?.start_at ? new Date(slot.start_at).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) : "-",
                venue: "",
                summary: finalized.title ?? "Zatwierdzony termin spotkania",
                finalized: true,
              };
            } else {
              nextMeeting = {
                id: finalized.id,
                title: finalized.title ?? (slot.label ?? "Nadchodzące spotkanie"),
                date: new Date(slot.start_at).toLocaleDateString("pl-PL", { day: "2-digit", month: "long", year: "numeric" }),
                time: new Date(slot.start_at).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
                venue: "",
                summary: slot.label ?? "Finalny termin spotkania",
                finalized: true,
              };
            }
          } else {
            // if no finalized meeting, check for an open meeting (voting ongoing)
            const { data: openMeeting, error: openErr } = await supabase
              .from("club_meetings")
              .select("id, title, created_at")
              .eq("club_id", data.id)
              .eq("status", "open")
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (!openErr && openMeeting) {
              nextMeeting = {
                id: openMeeting.id,
                title: openMeeting.title ?? "Głosowanie na termin",
                date: "",
                time: "",
                venue: "",
                summary: "Członkowie głosują nad proponowanymi terminami.",
                finalized: false,
              };
            }
          }
        } catch {
          // ignore and fall back to demo model
          nextMeeting = fallback.nextMeeting;
        }

        return {
          ...fallback,
          id: data.id,
          name: data.name,
          description: data.description ?? fallback.description,
          memberCount: memberCount ?? fallback.memberCount,
          activeVoting,
          nextMeeting,
        };
    }
  } catch {
    // Fall back to the local demo model when Supabase is unavailable.
  }

  return buildFallbackClubDashboard(normalizedId);
}

async function getRealClubMemberCount(clubId: string, creatorId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("club_members")
    .select("user_id, membership_status")
    .eq("club_id", clubId);

  if (error || !data) {
    return null;
  }

  const activeMemberIds = new Set(
    (data as ClubMemberCountRow[])
      .filter((member) => member.membership_status !== "left" && member.membership_status !== "pending")
      .map((member) => member.user_id),
  );
  const hasCreator = activeMemberIds.has(creatorId);

  return activeMemberIds.size + (hasCreator ? 0 : 1);
}

async function getRealProposalsCount(clubId: string) {
  const supabase = getSupabaseServerClient();
  const { count, error } = await supabase
    .from("book_proposals")
    .select("*", { count: "exact", head: true })
    .eq("club_id", clubId);

  if (error) {
    return null;
  }

  return count;
}

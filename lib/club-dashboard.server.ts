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
    title: "Nadchodzące spotkanie",
    date: "24 maja 2026",
    time: "18:30",
    venue: "Biblioteka miejska, sala 2",
    summary: "Podgląd najbliższego spotkania, który później rozszerzymy o pełny scheduler.",
  };
}

function buildDemoInvite(id: string, isEmptyState: boolean): ClubDashboardInvite {
  return {
    code: `${id.slice(0, 4).toUpperCase() || "BOOK"}-${Math.max(100, id.length * 17)}`,
    hint:
      "W stage 10 dodamy zaproszenia linkiem i mailem, a tutaj zostawiamy czytelny skrót do kolejnego kroku.",
    status: isEmptyState ? "Przygotowanie" : "Gotowe na dalszy etap",
  };
}

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
      .select("id, name, description")
      .eq("id", normalizedId)
      .maybeSingle();

    if (!error && data) {
      const fallback = buildFallbackClubDashboard(normalizedId);

      return {
        ...fallback,
        id: data.id,
        name: data.name,
        description: data.description ?? fallback.description,
      };
    }
  } catch {
    // Fall back to the local demo model when Supabase is unavailable.
  }

  return buildFallbackClubDashboard(normalizedId);
}

import { getSupabaseBrowserClient } from "./supabase.browser";

export type DashboardClubSummary = {
  id: string;
  name: string;
  description?: string;
};

type SupabaseDashboardClub = {
  id: string;
  name: string;
  description?: string | null;
};

type DashboardClubsResult = {
  clubs: DashboardClubSummary[];
  error: string | null;
};

const DASHBOARD_CLUBS_ERROR =
  "Nie udało się wczytać listy klubów. Spróbuj odświeżyć dashboard lub wróć później.";

export async function loadDashboardClubsByUserId(userId: string): Promise<DashboardClubsResult> {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    return { clubs: [], error: null };
  }

  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("clubs")
      .select("id, name, description")
      .eq("created_by", normalizedUserId)
      .order("created_at", { ascending: false });

    if (error) {
      return { clubs: [], error: DASHBOARD_CLUBS_ERROR };
    }

    const clubs = (data ?? []).map((club: SupabaseDashboardClub) => ({
      id: club.id,
      name: club.name,
      description: club.description ?? undefined,
    }));

    return { clubs, error: null };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Brakuje konfiguracji Supabase")) {
      return { clubs: [], error: error.message };
    }

    return { clubs: [], error: DASHBOARD_CLUBS_ERROR };
  }
}
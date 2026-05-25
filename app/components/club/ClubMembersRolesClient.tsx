"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MembersRoleManager from "./MembersRoleManager";
import type { ClubRolesViewModel } from "./roles";
import { getSupabaseBrowserClient } from "../../../lib/supabase.browser";

type ClubRolesApiResponse =
  | {
      ok: true;
      club: ClubRolesViewModel;
    }
  | {
      ok: false;
      message: string;
    };

type ClubMembersRolesClientProps = {
  clubId: string;
};

function getReturnToLoginHref(clubId: string) {
  return `/login?returnTo=${encodeURIComponent(`/club/${clubId}/members/manage`)}`;
}

export default function ClubMembersRolesClient({ clubId }: ClubMembersRolesClientProps) {
  const [club, setClub] = useState<ClubRolesViewModel | null>(null);
  const [statusMessage, setStatusMessage] = useState("Wczytujemy członków klubu...");
  const loginHref = getReturnToLoginHref(clubId);

  useEffect(() => {
    let active = true;

    async function loadClubRoles() {
      setStatusMessage("Wczytujemy członków klubu...");

      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token ?? null;

        if (!accessToken) {
          if (active) {
            setClub(null);
            setStatusMessage("Zaloguj się, aby zobaczyć członków i zarządzać rolami.");
          }

          return;
        }

        const response = await fetch(`/api/club-roles?clubId=${encodeURIComponent(clubId)}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const payload = (await response.json()) as ClubRolesApiResponse;

        if (!active) {
          return;
        }

        if (!payload.ok) {
          setClub(null);
          setStatusMessage(payload.message ?? "Nie udało się wczytać ról klubu.");
          return;
        }

        setClub(payload.club);
        setStatusMessage("Lista członków jest gotowa.");
      } catch {
        if (active) {
          setClub(null);
          setStatusMessage("Nie udało się wczytać ról klubu. Spróbuj ponownie.");
        }
      }
    }

    loadClubRoles();

    return () => {
      active = false;
    };
  }, [clubId]);

  if (!club) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 px-6 py-8 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Członkowie</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Wczytywanie danych klubu</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">{statusMessage}</p>
          <Link
            href={loginHref}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
          >
            Przejdź do logowania
          </Link>
        </div>
      </section>
    );
  }

  return <MembersRoleManager clubId={club.clubId} currentUserRole={club.currentUserRole} members={club.members} />;
}

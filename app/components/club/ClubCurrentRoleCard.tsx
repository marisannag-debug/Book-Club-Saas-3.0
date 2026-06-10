"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MemberRoleBadge from "./MemberRoleBadge";
import type { ClubRolesViewModel } from "./roles";
import { getSupabaseBrowserClient } from "../../../lib/supabase.browser";

type ClubCurrentRoleCardProps = {
  clubId: string;
};

type ClubRolesApiResponse =
  | {
      ok: true;
      club: ClubRolesViewModel;
    }
  | {
      ok: false;
      message: string;
    };

function getLoginHref(clubId: string) {
  return `/login?returnTo=${encodeURIComponent(`/club/${clubId}/members/manage`)}`;
}

export default function ClubCurrentRoleCard({ clubId }: ClubCurrentRoleCardProps) {
  const [message, setMessage] = useState("Wczytujemy Twoją rolę...");
  const [role, setRole] = useState<ClubRolesViewModel["currentUserRole"] | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCurrentRole() {
      setMessage("Wczytujemy Twoją rolę...");

      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token ?? null;

        if (!accessToken) {
          if (active) {
            setRole(null);
            setMessage("Zaloguj się, aby zobaczyć swoją rolę w klubie.");
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
          setRole(null);
          setMessage(payload.message ?? "Nie udało się wczytać Twojej roli.");
          return;
        }

        setRole(payload.club.currentUserRole);
        setMessage("Twoja rola jest gotowa.");
      } catch {
        if (active) {
          setRole(null);
          setMessage("Nie udało się wczytać Twojej roli. Spróbuj ponownie.");
        }
      }
    }

    loadCurrentRole();

    return () => {
      active = false;
    };
  }, [clubId]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Twoja rola</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {role ? <MemberRoleBadge role={role} /> : <p className="text-2xl font-semibold tracking-tight text-slate-950">Wczytywanie...</p>}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
      {!role ? (
        <Link
          href={getLoginHref(clubId)}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
        >
          Przejdź do logowania
        </Link>
      ) : null}
    </div>
  );
}
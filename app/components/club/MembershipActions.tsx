"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import MemberRoleBadge from "./MemberRoleBadge";
import type { ClubRole } from "./roles";
import { getSupabaseBrowserClient } from "../../../lib/supabase.browser";
import { normalizeMemberDisplayName, validateMemberDisplayName } from "../../../lib/membership";

type MembershipStatus = "pending" | "active" | "left";

type MembershipView = {
  memberId: string;
  displayName: string;
  status: MembershipStatus;
  joinedAt: string;
  isCreator: boolean;
  canAccept: boolean;
  canLeave: boolean;
  canRename: boolean;
};

type MembershipDetailsResponse =
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

type MembershipActionsResponse =
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

type MembershipActionsProps = {
  clubId: string;
  memberId: string;
};

function buildReturnToValue(clubId: string, memberId: string) {
  return `/club/${clubId}/members/${memberId}/actions`;
}

function buildLoginHref(clubId: string, memberId: string) {
  return `/login?returnTo=${encodeURIComponent(buildReturnToValue(clubId, memberId))}`;
}

export default function MembershipActions({ clubId, memberId }: MembershipActionsProps) {
  const router = useRouter();
  const [membership, setMembership] = useState<MembershipView | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<ClubRole | null>(null);
  const [clubName, setClubName] = useState("Członkostwo klubu");
  const [displayName, setDisplayName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Wczytujemy członkostwo...");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const loginHref = buildLoginHref(clubId, memberId);
  const isSelfRoute = memberId === "me";

  useEffect(() => {
    let active = true;

    async function loadMembership() {
      setIsLoading(true);
      setStatusMessage("Wczytujemy członkostwo...");

      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token ?? null;

        if (!accessToken) {
          if (active) {
            setAccessDenied(true);
            setMembership(null);
            setStatusMessage("Zaloguj się, aby zarządzać swoim członkostwem.");
          }

          return;
        }

        const response = await fetch(`/api/membership?clubId=${encodeURIComponent(clubId)}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const payload = (await response.json()) as MembershipDetailsResponse;

        if (!active) {
          return;
        }

        if (!payload.ok) {
          setAccessDenied(response.status === 401 || response.status === 403);
          setMembership(null);
          setStatusMessage(payload.message ?? "Nie udało się wczytać członkostwa.");
          return;
        }

        if (!isSelfRoute && payload.membership.memberId !== memberId) {
          setAccessDenied(true);
          setMembership(null);
          setStatusMessage("Ten ekran dotyczy tylko Twojego członkostwa.");
          return;
        }

        setCurrentUserRole(payload.currentUserRole);
        setClubName(payload.clubName);
        setMembership(payload.membership);
        setDisplayName(payload.membership.displayName);
        setAccessDenied(false);
        setStatusMessage("Członkostwo jest gotowe.");
      } catch {
        if (active) {
          setAccessDenied(false);
          setMembership(null);
          setStatusMessage("Nie udało się wczytać członkostwa. Spróbuj ponownie.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadMembership();

    return () => {
      active = false;
    };
  }, [clubId, isSelfRoute, memberId]);

  async function submitMembershipAction(body: Record<string, string>) {
    setIsSaving(true);
    setFieldError(null);
    setStatusMessage("Zapisujemy zmiany...");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token ?? null;

      if (!accessToken) {
        setStatusMessage("Zaloguj się ponownie, aby wykonać tę akcję.");
        setAccessDenied(true);
        return;
      }

      const response = await fetch("/api/membership", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as MembershipActionsResponse;

      if (!payload.ok) {
        setStatusMessage(payload.message ?? "Nie udało się zapisać zmian.");
        return;
      }

      setMembership(payload.membership);
      setDisplayName(payload.membership.displayName);
      setCurrentUserRole(payload.currentUserRole);
      setClubName(payload.clubName);
      setStatusMessage(payload.message);

      if (body.action === "leave") {
        router.replace("/dashboard");
      }
    } catch {
      setStatusMessage("Nie udało się zapisać zmian. Spróbuj ponownie.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAccept() {
    if (!membership?.canAccept) {
      return;
    }

    await submitMembershipAction({
      clubId,
      action: "accept",
    });
  }

  async function handleLeave() {
    if (!membership?.canLeave) {
      return;
    }

    await submitMembershipAction({
      clubId,
      action: "leave",
    });
  }

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!membership?.canRename) {
      return;
    }

    const validationError = validateMemberDisplayName(displayName);

    if (validationError) {
      setFieldError(validationError);
      setStatusMessage(validationError);
      return;
    }

    await submitMembershipAction({
      clubId,
      action: "rename",
      displayName: normalizeMemberDisplayName(displayName),
    });
  }

  if (isLoading && !membership) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 px-6 py-8 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Członkostwo</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Wczytujemy szczegóły</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{statusMessage}</p>
      </section>
    );
  }

  if (accessDenied || !membership) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 px-6 py-8 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Członkostwo</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Dostęp do członkostwa</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{statusMessage}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={loginHref}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
          >
            Zaloguj się
          </Link>
          <Link
            href={`/club/${clubId}`}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
          >
            Wróć do klubu
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Członkostwo</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{clubName}</h2>
          </div>
          <MemberRoleBadge role={currentUserRole ?? "member"} />
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{statusMessage}</p>
      </div>

      <div className="grid gap-8 px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Twój status</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-950">
                {membership.status === "active"
                  ? "Aktywne członkostwo"
                  : membership.status === "pending"
                    ? "Oczekuje na akceptację"
                    : "Członkostwo zakończone"}
              </span>
              {membership.isCreator ? (
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
                  Twórca klubu
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">Dołączyłeś: {membership.joinedAt}</p>
          </div>

          <form className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5" onSubmit={handleRename} noValidate>
            <div className="space-y-2">
              <label htmlFor="membership-display-name" className="text-sm font-semibold text-slate-950">
                Twoja nazwa wyświetlana
              </label>
              <input
                id="membership-display-name"
                name="membership-display-name"
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setFieldError(null);
                }}
                disabled={!membership.canRename || isSaving}
                aria-invalid={Boolean(fieldError)}
                aria-describedby="membership-display-name-help membership-display-name-error"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                placeholder="Na przykład: Aga z Mokotowa"
              />
              <p id="membership-display-name-help" className="text-xs leading-5 text-slate-500">
                Ta nazwa jest widoczna dla innych członków klubu.
              </p>
              <p id="membership-display-name-error" aria-live="polite" className="min-h-5 text-sm text-red-600">
                {fieldError || "\u00A0"}
              </p>
            </div>

            <button
              type="submit"
              disabled={!membership.canRename || isSaving}
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              {isSaving ? "Zapisujemy..." : "Zapisz nazwę"}
            </button>
          </form>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Akcje</p>

          {membership.canAccept ? (
            <button
              type="button"
              onClick={handleAccept}
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-950/20"
            >
              {isSaving ? "Aktywujemy..." : "Akceptuj członkostwo"}
            </button>
          ) : null}

          {membership.canLeave ? (
            <button
              type="button"
              onClick={handleLeave}
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center rounded-full border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-red-100 disabled:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              {isSaving ? "Wychodzimy..." : "Opuść klub"}
            </button>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
              {membership.isCreator
                ? "Twórca klubu nie może opuścić klubu z tego ekranu."
                : "Nie możesz już opuścić tego klubu."}
            </div>
          )}

          <div aria-live="polite" className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-700">
            {statusMessage}
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href={`/club/${clubId}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              Wróć do klubu
            </Link>
            <Link
              href={`/club/${clubId}/members/manage`}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              Zarządzaj rolami
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

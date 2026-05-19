"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../../../lib/supabase.browser";

type InvitePreview = {
  clubId: string;
  clubName: string;
  invitedEmail: string | null;
  inviteCode: string;
  inviteUrl: string;
  expiresAt: string;
  status: string;
};

function normalizeInternalPath(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/dashboard";
  }

  return value;
}

function buildReturnToValue(pathname: string, searchParams: URLSearchParams) {
  const queryString = searchParams.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export default function JoinClubForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inviteToken = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);
  const returnTo = buildReturnToValue(pathname, searchParams);
  const authReturnTo = encodeURIComponent(returnTo);
  const loginHref = `/login?returnTo=${authReturnTo}`;
  const registerHref = `/register?returnTo=${authReturnTo}`;
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Wpisz kod lub użyj linku z zaproszenia.");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [invitePreview, setInvitePreview] = useState<InvitePreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();

        if (!active) {
          return;
        }

        setSessionToken(data.session?.access_token ?? null);
      } catch {
        if (active) {
          setSessionToken(null);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!inviteToken) {
      setInvitePreview(null);
      setPreviewError(null);
      return;
    }

    let active = true;
    setPreviewLoading(true);
    setPreviewError(null);

    fetch(`/api/club-invites/preview?token=${encodeURIComponent(inviteToken)}`)
      .then(async (response) => {
        const payload = (await response.json()) as {
          ok: boolean;
          invite?: InvitePreview;
          message?: string;
        };

        if (!active) {
          return;
        }

        if (!response.ok || !payload.ok || !payload.invite) {
          setInvitePreview(null);
          setPreviewError(payload.message ?? "Nie udało się wczytać zaproszenia.");
          return;
        }

        setInvitePreview(payload.invite);
      })
      .catch(() => {
        if (active) {
          setInvitePreview(null);
          setPreviewError("Nie udało się wczytać zaproszenia.");
        }
      })
      .finally(() => {
        if (active) {
          setPreviewLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [inviteToken]);

  async function getAccessToken() {
    if (sessionToken) {
      return sessionToken;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token ?? null;

      setSessionToken(accessToken);

      return accessToken;
    } catch {
      return null;
    }
  }

  async function redeemInvite(payload: { inviteCode?: string; inviteToken?: string }) {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      setStatusMessage("Zaloguj się, aby dołączyć do klubu.");
      return;
    }

    setLoading(true);
    setStatusMessage("Sprawdzamy zaproszenie...");

    try {
      const response = await fetch("/api/club-invites/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        ok: boolean;
        message: string;
        clubId?: string;
      };

      if (!response.ok || !data.ok || !data.clubId) {
        setStatusMessage(data.message ?? "Nie udało się dołączyć do klubu.");
        return;
      }

      setStatusMessage(data.message);
      router.replace(`/club/${data.clubId}`);
    } catch {
      setStatusMessage("Nie udało się dołączyć do klubu. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCode = inviteCode.trim();

    if (!normalizedCode) {
      setStatusMessage("Podaj kod zaproszenia lub użyj linku z maila.");
      return;
    }

    await redeemInvite({ inviteCode: normalizedCode });
  }

  return (
    <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_16px_50px_-30px_rgba(15,23,42,0.3)] backdrop-blur sm:p-8">
      <section className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Dołącz przez kod</p>
        <form className="space-y-4" onSubmit={handleCodeSubmit} noValidate>
          <div className="space-y-2">
            <label htmlFor="invite-code" className="text-sm font-semibold text-slate-950">
              Kod zaproszenia
            </label>
            <input
              id="invite-code"
              name="invite-code"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
              autoComplete="off"
              inputMode="text"
              placeholder="BK-1A2B3C4D"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            <p className="text-xs leading-5 text-slate-500">
              Kod znajdziesz w e-mailu albo w wiadomości od prowadzącego klubu.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
          >
            {loading ? "Dołączamy..." : "Dołącz z kodu"}
          </button>
        </form>
      </section>

      <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Dołącz przez link</p>
        {inviteToken ? (
          previewLoading ? (
            <p className="text-sm leading-6 text-slate-600">Wczytujemy szczegóły zaproszenia...</p>
          ) : previewError ? (
            <p className="text-sm leading-6 text-red-700" role="alert">
              {previewError}
            </p>
          ) : invitePreview ? (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Klub</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{invitePreview.clubName}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Kod awaryjny: <span className="font-semibold text-slate-900">{invitePreview.inviteCode}</span>
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">Ważne do: {invitePreview.expiresAt}</p>
              </div>

              {sessionToken ? (
                <button
                  type="button"
                  onClick={() => redeemInvite({ inviteToken })}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-950/20"
                >
                  {loading ? "Dołączamy..." : "Dołącz z linku"}
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-slate-600">
                    Zaloguj się lub załóż konto, aby potwierdzić dołączenie do tego klubu.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={loginHref}
                      className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
                    >
                      Zaloguj się
                    </Link>
                    <Link
                      href={registerHref}
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
                    >
                      Załóż konto
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : null
        ) : (
          <p className="text-sm leading-6 text-slate-600">
            Otwórz link z e-maila od prowadzącego, aby zobaczyć szczegóły klubu i dołączyć jednym kliknięciem.
          </p>
        )}
      </section>

      <div aria-live="polite" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
        {statusMessage}
      </div>
    </div>
  );
}
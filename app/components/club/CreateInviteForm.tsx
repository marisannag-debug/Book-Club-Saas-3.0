"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../../../lib/supabase.browser";

type CreateInviteResult = {
  ok: boolean;
  message: string;
  emailSent?: boolean;
  invite?: {
    clubId: string;
    clubName: string;
    invitedEmail: string | null;
    inviteCode: string;
    inviteUrl: string;
    expiresAt: string;
  };
};

type CreateInviteFormProps = {
  clubId: string;
  clubName: string;
};

function copyToClipboard(value: string) {
  return navigator.clipboard.writeText(value);
}

export default function CreateInviteForm({ clubId, clubName }: CreateInviteFormProps) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Wygeneruj zaproszenie dla członka klubu.");
  const [result, setResult] = useState<CreateInviteResult["invite"] | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const hasSession = useMemo(() => Boolean(sessionToken), [sessionToken]);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();

        if (active) {
          setSessionToken(data.session?.access_token ?? null);
        }
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!sessionToken) {
      setStatusMessage("Zaloguj się, aby wygenerować zaproszenie.");
      return;
    }

    setLoading(true);
    setStatusMessage("Generujemy zaproszenie...");
    setCopyMessage(null);

    try {
      const response = await fetch("/api/club-invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          clubId,
          invitedEmail: invitedEmail.trim() || undefined,
        }),
      });

      const data = (await response.json()) as CreateInviteResult;

      if (!response.ok || !data.ok || !data.invite) {
        setStatusMessage(data.message ?? "Nie udało się wygenerować zaproszenia.");
        return;
      }

      setResult(data.invite);
      setStatusMessage(data.message);
    } catch {
      setStatusMessage("Nie udało się wygenerować zaproszenia. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(value: string, label: string) {
    try {
      await copyToClipboard(value);
      setCopyMessage(`${label} skopiowano do schowka.`);
    } catch {
      setCopyMessage("Nie udało się skopiować do schowka.");
    }
  }

  return (
    <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_16px_50px_-30px_rgba(15,23,42,0.3)] backdrop-blur sm:p-8">
      {!hasSession ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
          Zaloguj się, aby wygenerować zaproszenie dla <span className="font-semibold">{clubName}</span>.
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label htmlFor="invited-email" className="text-sm font-semibold text-slate-950">
            Adres e-mail odbiorcy
          </label>
          <input
            id="invited-email"
            name="invited-email"
            type="email"
            value={invitedEmail}
            onChange={(event) => setInvitedEmail(event.target.value)}
            autoComplete="email"
            placeholder="opcjonalnie: reader@example.com"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
          <p className="text-xs leading-5 text-slate-500">
            E-mail jest opcjonalny, ale pomaga przypiąć zaproszenie do konkretnej osoby.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
        >
          {loading ? "Generujemy..." : "Wygeneruj zaproszenie"}
        </button>
      </form>

      {result ? (
        <section className="space-y-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Zaproszenie gotowe</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-emerald-950">{clubName}</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-900">Ważne do: {result.expiresAt}</p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Kod</dt>
              <dd className="mt-1 text-lg font-semibold tracking-tight text-slate-950">{result.inviteCode}</dd>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Link</dt>
              <dd className="mt-1 break-all text-sm font-medium text-slate-950">{result.inviteUrl}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleCopy(result.inviteUrl, "Link")}
              className="inline-flex items-center justify-center rounded-full bg-emerald-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-950/20"
            >
              Kopiuj link
            </button>
            <button
              type="button"
              onClick={() => handleCopy(result.inviteCode, "Kod")}
              className="inline-flex items-center justify-center rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:border-emerald-400 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-950/20"
            >
              Kopiuj kod
            </button>
            <Link
              href={`/club/${clubId}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              Wróć do klubu
            </Link>
          </div>
        </section>
      ) : null}

      <div aria-live="polite" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
        {statusMessage}
        {copyMessage ? <span className="block text-emerald-800">{copyMessage}</span> : null}
      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import type { MeetingSlotDraft, MeetingSlotFieldErrors } from "./types";
import { getSupabaseBrowserClient } from "../../../lib/supabase.browser";

type Props = {
  clubId?: string;
  meetingId?: string;
  onAdded?: (slot: {
    id: string;
    label: string;
    startLabel: string;
    endLabel: string | null;
    votesCount: number;
    currentUserHasVoted: boolean;
    createdByIsCurrentUser: boolean;
    createdByLabel: string;
  }) => void;
};

const EMPTY_DRAFT: MeetingSlotDraft = {
  date: "",
  time: "",
  venue: "",
  description: "",
};

export default function MeetingSlotForm({ clubId, meetingId, onAdded }: Props) {
  const [draft, setDraft] = useState<MeetingSlotDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<MeetingSlotFieldErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field: keyof MeetingSlotDraft, value: string) {
    setDraft((d) => ({ ...d, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): MeetingSlotFieldErrors {
    const next: MeetingSlotFieldErrors = {};
    if (!draft.date) next.date = "Wybierz datę";
    if (!draft.time) next.time = "Wybierz godzinę";
    if (!draft.venue || draft.venue.trim().length < 3) next.venue = "Podaj miejsce (min. 3 znaki)";
    if (draft.description && draft.description.length > 280) next.description = "Opis może mieć maksymalnie 280 znaków.";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      setStatusMessage("Popraw pola i spróbuj ponownie.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Zapisujemy propozycję terminu...");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;

      if (!token) {
        setStatusMessage("Zaloguj się, aby dodać propozycję terminu.");
        setIsSubmitting(false);
        return;
      }

      // If meetingId was provided, send payload matching /api/meeting-slots expectations.
      // Otherwise, inform user to open the meeting planner — we don't auto-map club->meeting.
      if (!meetingId && !clubId) {
        setStatusMessage("Brakuje kontekstu spotkania. Otwórz planer spotkań, aby dodać termin.");
        setIsSubmitting(false);
        return;
      }

      if (!meetingId) {
        // No meetingId: guide user to create/open a meeting
        setStatusMessage("Aby dodać termin, otwórz planer spotkań dla tego klubu (link poniżej)." + (clubId ? "" : ""));
        setIsSubmitting(false);
        return;
      }

      const isoStart = new Date(`${draft.date}T${draft.time}`).toISOString();
      const isoEnd = null;

      const response = await fetch("/api/meeting-slots", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meetingId: meetingId, startAt: isoStart, endAt: isoEnd, label: draft.venue ?? null }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || (payload && payload.ok === false)) {
        setStatusMessage(payload?.message ?? "Nie udało się dodać terminu.");
        setIsSubmitting(false);
        return;
      }

      setStatusMessage("Propozycja terminu została dodana.");
      // notify parent with minimal slot metadata so it can update UI optimistically
      if (payload && payload.slotId && onAdded) {
        const slotObj = {
          id: payload.slotId,
          label: draft.venue || "Proponowany termin",
          startLabel: `${draft.date} • ${draft.time}`,
          endLabel: draft.description ? `${draft.date} • ${draft.description}` : null,
          votesCount: 0,
          currentUserHasVoted: false,
          createdByIsCurrentUser: true,
          createdByLabel: "Ty",
        };

        try {
          onAdded(slotObj);
        } catch {
          // ignore
        }
      }

      setDraft(EMPTY_DRAFT);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Nieznany błąd.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // meetingId comes from props; keep clubId for link generation

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Nowy termin spotkania</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-900">Data</label>
          <input
            type="date"
            value={draft.date}
            onChange={(e) => update("date", e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="text-xs text-red-600">{errors.date || "\u00A0"}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900">Godzina</label>
          <input
            type="time"
            value={draft.time}
            onChange={(e) => update("time", e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="text-xs text-red-600">{errors.time || "\u00A0"}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-900">Miejsce</label>
        <input
          type="text"
          value={draft.venue}
          onChange={(e) => update("venue", e.target.value)}
          placeholder="Na przykład: Biblioteka miejska, sala 2"
          className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
        />
        <p className="text-xs text-red-600">{errors.venue || "\u00A0"}</p>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-900">Uwagi (opcjonalne)</label>
        <textarea
          value={draft.description}
          onChange={(e) => update("description", e.target.value)}
          maxLength={280}
          className="mt-1 w-full min-h-[4rem] rounded-2xl border border-slate-300 px-3 py-2 text-sm"
          placeholder="Dodatkowe uwagi do propozycji terminu"
        />
        <p className="text-xs text-red-600">{errors.description || "\u00A0"}</p>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? "Zapis..." : "Dodaj termin"}
        </button>
        <div className="flex-1 text-sm text-slate-600">{statusMessage}</div>
      </div>

      {/* when no meetingId provided show helper link if clubId present */}
      {!meetingId && clubId ? (
        <div className="mt-2 text-sm">
          <a href={`/club/${clubId}/meetings/create`} className="text-emerald-700 underline">
            Otwórz planer spotkań tego klubu, aby dodać termin
          </a>
        </div>
      ) : null}
    </form>
  );
}

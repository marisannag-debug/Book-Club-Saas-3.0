"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { MeetingPoll, MeetingPollRole, MeetingPollSlot, MeetingSlotDraft } from "./types";
import { getSupabaseBrowserClient } from "../../../lib/supabase.browser";

type MeetingPlannerWorkspaceProps = {
  clubId: string;
  clubName: string;
  initialMeeting: MeetingPoll | null;
};

const EMPTY_SLOT_DRAFT: MeetingSlotDraft = {
  id: "slot-draft",
  label: "",
  date: "",
  time: "",
  endTime: "",
};

function getTodayLabel() {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function formatStartLabel(date: string, time: string) {
  return `${date} • ${time}`;
}

async function getAccessToken() {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

function buildMeetingSlotFromDraft(existingSlots: MeetingPollSlot[], draft: MeetingSlotDraft, slotId: string): MeetingPollSlot {
  const label = draft.label.trim();
  const date = draft.date.trim();
  const time = draft.time.trim();
  const endTime = draft.endTime.trim();

  return {
    id: slotId,
    label: label || `Propozycja ${existingSlots.length + 1}`,
    startLabel: formatStartLabel(date, time),
    endLabel: endTime ? formatStartLabel(date, endTime) : "Brak czasu zakończenia",
    votesCount: 0,
    currentUserHasVoted: false,
    createdByIsCurrentUser: true,
    createdByLabel: "Ty",
  };
}

export default function MeetingPlannerWorkspace({ clubId, clubName, initialMeeting }: MeetingPlannerWorkspaceProps) {
  const [meeting, setMeeting] = useState<MeetingPoll | null>(() => initialMeeting);
  const [slotDraft, setSlotDraft] = useState<MeetingSlotDraft>(EMPTY_SLOT_DRAFT);
  const [statusMessage, setStatusMessage] = useState(
    initialMeeting?.slots.length
      ? "Wczytano zapisane propozycje terminów z backendu."
      : "Ładuję planer spotkania…",
  );
  const [isBusy, setIsBusy] = useState(false);
  const [isLoadingMeeting, setIsLoadingMeeting] = useState(!initialMeeting);

  const initializePlannerMeeting = useCallback(async () => {
    const token = await getAccessToken();

    if (!token) {
      setStatusMessage("Zaloguj się, aby otworzyć planer spotkania.");
      setIsLoadingMeeting(false);
      return;
    }

    const response = await fetch("/api/meeting-planner", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clubId }),
    });

    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      message?: string;
      meeting?: MeetingPoll;
    } | null;

    if (!response.ok || payload?.ok === false || !payload?.meeting) {
      setStatusMessage(payload?.message ?? "Nie udało się wczytać planera spotkania.");
      setIsLoadingMeeting(false);
      return;
    }

    setMeeting(payload.meeting);
    setStatusMessage(
      payload.meeting.slots.length > 0
        ? "Wczytano zapisane propozycje terminów z backendu."
        : "Dodaj pierwszą propozycję terminu, a potem głosuj na najlepszą.",
    );
    setIsLoadingMeeting(false);
  }, [clubId]);

  useEffect(() => {
    if (!isLoadingMeeting || meeting) {
      return;
    }

    let cancelled = false;

    async function loadPlannerMeeting() {
      try {
        if (!cancelled) {
          await initializePlannerMeeting();
        }
      } catch (error) {
        if (!cancelled) {
          setStatusMessage(error instanceof Error ? error.message : "Nie udało się połączyć z backendem.");
          setIsLoadingMeeting(false);
        }
      }
    }

    void loadPlannerMeeting();

    return () => {
      cancelled = true;
    };
  }, [clubId, initializePlannerMeeting, isLoadingMeeting, meeting]);

  if (!meeting) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Stage 14 · planer spotkania</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {isLoadingMeeting ? "Ładowanie planera spotkania" : "Nie udało się wczytać planera spotkania"}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{statusMessage}</p>
        {!isLoadingMeeting ? (
          <button
            type="button"
            onClick={() => {
              setIsLoadingMeeting(true);
              setStatusMessage("Tworzenie planera spotkania...");
              void initializePlannerMeeting().catch(() => {
                setStatusMessage("Nie udało się połączyć z backendem.");
                setIsLoadingMeeting(false);
              });
            }}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
          >
            Utwórz planer spotkania
          </button>
        ) : null}
      </section>
    );
  }

  const leadingSlot = [...meeting.slots].sort((left, right) => right.votesCount - left.votesCount)[0] ?? null;
  const totalVotes = meeting.slots.reduce((sum, slot) => sum + slot.votesCount, 0);
  const currentUserRole: MeetingPollRole = meeting.currentUserRole ?? "host";

  function updateDraft(field: keyof MeetingSlotDraft, value: string) {
    setSlotDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  }

  function resetDraft() {
    setSlotDraft(EMPTY_SLOT_DRAFT);
  }

  async function addSlot() {
    if (isBusy || !meeting) {
      return;
    }

    const date = slotDraft.date.trim();
    const time = slotDraft.time.trim();

    if (!date) {
      setStatusMessage("Wybierz datę przed dodaniem propozycji.");
      return;
    }

    if (!time) {
      setStatusMessage("Wybierz godzinę przed dodaniem propozycji.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Zapisywanie propozycji terminu w backendzie...");

    try {
      const token = await getAccessToken();

      if (!token) {
        setStatusMessage("Zaloguj się, aby zapisać propozycję terminu w backendzie.");
        return;
      }

      const response = await fetch("/api/meeting-slots", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingId: meeting.id,
          startAt: new Date(`${date}T${time}`).toISOString(),
          endAt: slotDraft.endTime.trim() ? new Date(`${date}T${slotDraft.endTime.trim()}`).toISOString() : null,
          label: slotDraft.label.trim() || null,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string; slotId?: string } | null;

      if (!response.ok || payload?.ok === false || !payload?.slotId) {
        setStatusMessage(payload?.message ?? "Nie udało się dodać terminu.");
        return;
      }

      const nextSlot = buildMeetingSlotFromDraft(meeting.slots, slotDraft, payload.slotId);

      setMeeting((currentMeeting) => ({
        ...currentMeeting,
        status: "open",
        updatedAtLabel: getTodayLabel(),
        slots: [...currentMeeting.slots, nextSlot],
      }));
      resetDraft();
      setStatusMessage("Propozycja terminu została dodana. Możesz teraz głosować na tej samej stronie.");
    } catch {
      setStatusMessage("Nie udało się połączyć z backendem.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleVote(slotId: string) {
    if (isBusy || !meeting) {
      return;
    }

    if (meeting.status === "finalized") {
      setStatusMessage("Nie można zmienić głosu po finalizacji terminu.");
      return;
    }

    const previousVoteId = meeting.currentUserVoteSlotId;
    const nextVoteId = previousVoteId === slotId ? null : slotId;

    setIsBusy(true);
    setStatusMessage(nextVoteId ? "Zapisywanie głosu w backendzie..." : "Usuwanie głosu z backendu...");

    try {
      const token = await getAccessToken();

      if (!token) {
        setStatusMessage("Zaloguj się, aby zagłosować w backendzie.");
        return;
      }

      const response = nextVoteId
        ? await fetch("/api/meeting-votes", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ meetingId: meeting.id, slotId: nextVoteId }),
          })
        : await fetch(`/api/meeting-votes?meetingId=${encodeURIComponent(meeting.id)}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

      const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;

      if (!response.ok || payload?.ok === false) {
        setStatusMessage(payload?.message ?? "Nie udało się zapisać głosu.");
        return;
      }

      setMeeting((currentMeeting) => ({
        ...currentMeeting,
        status: currentMeeting.status === "draft" ? "open" : currentMeeting.status,
        updatedAtLabel: getTodayLabel(),
        currentUserVoteSlotId: nextVoteId,
        slots: currentMeeting.slots.map((slot) => {
          const wasSelected = slot.id === previousVoteId;
          const isSelected = slot.id === nextVoteId;

          return {
            ...slot,
            votesCount: slot.votesCount + (isSelected ? 1 : 0) - (wasSelected ? 1 : 0),
            currentUserHasVoted: isSelected,
          };
        }),
      }));

      setStatusMessage(nextVoteId ? "Twój głos został zapisany w backendzie." : "Cofnięto głos w backendzie.");
    } catch {
      setStatusMessage("Nie udało się połączyć z backendem.");
    } finally {
      setIsBusy(false);
    }
  }

  async function removeSlot(slotId: string) {
    if (isBusy || !meeting) {
      return;
    }

    const slot = meeting.slots.find((candidate) => candidate.id === slotId);

    if (!slot) {
      setStatusMessage("Nie znaleziono terminu.");
      return;
    }

    if (!(currentUserRole === "host" || slot.createdByIsCurrentUser)) {
      setStatusMessage("Nie masz uprawnień do usunięcia tego terminu.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Usuwanie propozycji terminu z backendu...");

    try {
      const token = await getAccessToken();

      if (!token) {
        setStatusMessage("Zaloguj się, aby usunąć propozycję z backendu.");
        return;
      }

      const response = await fetch(`/api/meeting-slots?slotId=${encodeURIComponent(slotId)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;

      if (!response.ok || payload?.ok === false) {
        setStatusMessage(payload?.message ?? "Nie udało się usunąć terminu.");
        return;
      }

      setMeeting((currentMeeting) => {
        const nextSlots = currentMeeting.slots.filter((candidate) => candidate.id !== slotId);
        const removedCurrentVote = currentMeeting.currentUserVoteSlotId === slotId;

        return {
          ...currentMeeting,
          status: nextSlots.length > 0 ? "open" : "draft",
          currentUserVoteSlotId: removedCurrentVote ? null : currentMeeting.currentUserVoteSlotId,
          finalizedSlotId: currentMeeting.finalizedSlotId === slotId ? null : currentMeeting.finalizedSlotId,
          updatedAtLabel: getTodayLabel(),
          slots: nextSlots,
        };
      });

      setStatusMessage("Usunięto propozycję terminu.");
    } catch {
      setStatusMessage("Nie udało się połączyć z backendem.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 px-6 py-8 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Stage 14 · planer spotkania</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{meeting.title}</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">{meeting.description}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              {meeting.status === "draft" ? "Szkic" : "Otwarte głosowanie"}
            </span>
            <span className="inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              {currentUserRole === "host" ? "Widok prowadzącego" : "Widok członka"}
            </span>
          </div>
        </div>

        <div aria-live="polite" className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
          {statusMessage}
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Klub</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{clubName}</dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Propozycje</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              {meeting.slots.length > 0 ? `${meeting.slots.length} propozycji terminu` : "Brak propozycji"}
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Głosy</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{totalVotes} oddanych głosów</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form
          className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8"
          onSubmit={(event) => {
            event.preventDefault();
            void addSlot();
          }}
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Dodawanie terminów</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Dodaj jedną propozycję</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Każdy termin dodajesz osobno. Po zapisaniu pojawia się na liście obok i od razu można na niego głosować.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Nazwa propozycji</span>
              <input
                value={slotDraft.label}
                onChange={(event) => updateDraft("label", event.target.value)}
                type="text"
                placeholder="Na przykład: Wieczór wtorkowy"
                className="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/15"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Data</span>
                <input
                  value={slotDraft.date}
                  onChange={(event) => updateDraft("date", event.target.value)}
                  type="date"
                  className="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/15"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Godzina startu</span>
                <input
                  value={slotDraft.time}
                  onChange={(event) => updateDraft("time", event.target.value)}
                  type="time"
                  className="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/15"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Godzina zakończenia, opcjonalnie</span>
              <input
                value={slotDraft.endTime}
                onChange={(event) => updateDraft("endTime", event.target.value)}
                type="time"
                className="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/15"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              Dodaj propozycję
            </button>
            <button
              type="button"
              onClick={() => {
                resetDraft();
                setStatusMessage("Wyczyściliśmy formularz pojedynczej propozycji.");
              }}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              Wyczyść
            </button>
            <Link
              href={`/club/${clubId}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              Wróć do klubu
            </Link>
          </div>
        </form>

        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Głosowanie</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Wybierz najlepszy termin</h3>
            </div>
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              {meeting.slots.length} terminów
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {meeting.slots.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-600">
                Jeszcze nie dodano żadnych propozycji. Wypełnij formularz po lewej, a tutaj pojawią się karty do głosowania.
              </div>
            ) : (
              meeting.slots.map((slot) => {
                const isLeading = leadingSlot?.id === slot.id;
                const isFinalized = meeting.finalizedSlotId === slot.id;
                const voteLabel = slot.votesCount === 1 ? "1 głos" : `${slot.votesCount} głosów`;

                return (
                  <article
                    key={slot.id}
                    className={`rounded-[1.75rem] border p-4 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)] ${
                      isFinalized
                        ? "border-emerald-300 bg-emerald-50"
                        : isLeading
                          ? "border-slate-950 bg-white"
                          : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Termin {slot.startLabel}</p>
                        <h4 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{slot.label}</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{slot.endLabel}</p>
                      </div>
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                        {voteLabel}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void handleVote(slot.id)}
                        disabled={isBusy}
                        aria-pressed={slot.currentUserHasVoted}
                        aria-label={slot.currentUserHasVoted ? `Cofnij głos dla ${slot.label}` : `Zagłosuj na ${slot.label}`}
                        className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-950/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                          slot.currentUserHasVoted
                            ? "border border-slate-950 bg-slate-950 text-white hover:bg-slate-800"
                            : "border border-slate-300 bg-white text-slate-950 hover:border-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {slot.currentUserHasVoted ? "Twój wybór" : "Zagłosuj"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void removeSlot(slot.id)}
                        disabled={isBusy}
                        className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-900 transition hover:border-red-300 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-900/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Usuń termin
                      </button>
                    </div>

                    {isFinalized ? (
                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm leading-6 text-emerald-900">
                        Ten termin został zatwierdzony jako finalny.
                      </div>
                    ) : isLeading ? (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                        Najwięcej głosów w tym momencie ma ten termin.
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-900">Najlepszy termin</p>
              <p className="mt-1">{leadingSlot ? leadingSlot.label : "Brak głosów"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-900">Twój głos</p>
              <p className="mt-1">{meeting.currentUserVoteSlotId ? "Masz zapisany wybór" : "Nie zagłosowano jeszcze"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-900">Stan planera</p>
              <p className="mt-1">{meeting.status === "finalized" ? "Termin potwierdzony" : "Głosowanie nadal otwarte"}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            Wszystkie zmiany są zapisywane w backendzie Supabase, więc możesz dodawać kolejne propozycje i głosować bez przeładowania strony.
          </div>
        </section>
      </section>
    </div>
  );
}

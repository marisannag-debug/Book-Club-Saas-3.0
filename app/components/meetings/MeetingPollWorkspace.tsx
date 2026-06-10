"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../../..//lib/supabase.browser";
import type {
  MeetingPoll,
  MeetingPollDraft,
  MeetingPollRole,
  MeetingPollSlot,
  MeetingPollStatus,
  MeetingSlotDraft,
} from "./types";
import MeetingSlotForm from "../voting/MeetingSlotForm";

type MeetingPollWorkspaceProps = {
  clubId: string;
  clubName: string;
  mode: "create" | "detail";
  meetingId?: string;
};

type SlotDraftField = keyof Omit<MeetingSlotDraft, "id">;

const EMPTY_MEETING_DRAFT: MeetingPollDraft = {
  title: "",
  description: "",
};

function createEmptySlotDraft(index: number): MeetingSlotDraft {
  return {
    id: `slot-draft-${index + 1}-${Math.random().toString(36).slice(2, 7)}`,
    label: "",
    date: "",
    time: "",
    endTime: "",
  };
}

function createSlotId(seed: string, index: number) {
  return `${seed}-${index + 1}-${Math.random().toString(36).slice(2, 8)}`;
}

function createMeetingId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `meeting-${Date.now()}`;
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function buildStorageKey(clubId: string, meetingId: string) {
  return `bookclub-pro:meeting-polls:${clubId}:${meetingId}`;
}

function loadStoredMeeting(clubId: string, meetingId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(buildStorageKey(clubId, meetingId));

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as MeetingPoll;
  } catch {
    return null;
  }
}

function persistMeeting(meeting: MeetingPoll) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(buildStorageKey(meeting.clubId, meeting.id), JSON.stringify(meeting));
}

function createDemoMeeting(clubId: string, clubName: string, meetingId: string): MeetingPoll {
  const todayLabel = getTodayLabel();
  const seed = meetingId.length + clubId.length;

  const slots: MeetingPollSlot[] = [
    {
      id: createSlotId(`${meetingId}-slot`, 0),
      label: "Spotkanie popołudniowe",
      startLabel: "wtorek, 18:00",
      endLabel: "wtorek, 19:30",
      votesCount: 2 + (seed % 2),
      currentUserHasVoted: false,
      createdByIsCurrentUser: false,
      createdByLabel: "Prowadzący klubu",
    },
    {
      id: createSlotId(`${meetingId}-slot`, 1),
      label: "Czwartkowy wieczór",
      startLabel: "czwartek, 19:00",
      endLabel: "czwartek, 20:30",
      votesCount: 3 + (seed % 3),
      currentUserHasVoted: true,
      createdByIsCurrentUser: false,
      createdByLabel: "Inny członek",
    },
    {
      id: createSlotId(`${meetingId}-slot`, 2),
      label: "Weekendowy termin",
      startLabel: "sobota, 11:00",
      endLabel: "sobota, 12:30",
      votesCount: 1 + (seed % 2),
      currentUserHasVoted: false,
      createdByIsCurrentUser: false,
      createdByLabel: "Inny członek",
    },
  ];

  return {
    id: meetingId,
    clubId,
    clubName,
    title: `${clubName} — wybór terminu spotkania`,
    description: "Demo ankiety w trybie front-endowym. Po wdrożeniu backendu zapis przejdzie do Supabase.",
    status: "open",
    createdAtLabel: todayLabel,
    updatedAtLabel: todayLabel,
    createdByLabel: "Prowadzący klubu",
    finalizedSlotId: null,
    currentUserRole: "host",
    currentUserVoteSlotId: slots.find((slot) => slot.currentUserHasVoted)?.id ?? null,
    slots,
  };
}

function buildMeetingFromDraft(
  clubId: string,
  clubName: string,
  meetingId: string,
  meetingDraft: MeetingPollDraft,
  slotDrafts: MeetingSlotDraft[],
  currentUserRole: MeetingPollRole,
): MeetingPoll {
  const todayLabel = getTodayLabel();

  return {
    id: meetingId,
    clubId,
    clubName,
    title: meetingDraft.title.trim(),
    description: meetingDraft.description.trim(),
    status: "open",
    createdAtLabel: todayLabel,
    updatedAtLabel: todayLabel,
    createdByLabel: currentUserRole === "host" ? "Ty" : "Członek klubu",
    finalizedSlotId: null,
    currentUserRole,
    currentUserVoteSlotId: null,
    slots: slotDrafts.map((draft, index) => ({
      id: createSlotId(meetingId, index),
      label: draft.label.trim() || `Termin ${index + 1}`,
      startLabel: `${draft.date} • ${draft.time}`,
      endLabel: draft.endTime ? `${draft.date} • ${draft.endTime}` : "Brak czasu zakończenia",
      votesCount: 0,
      currentUserHasVoted: false,
      createdByIsCurrentUser: true,
      createdByLabel: currentUserRole === "host" ? "Ty" : "Ty",
    })),
  };
}

function getNextStatusMessage(action: string) {
  if (action === "create") {
    return "Wpisz kilka terminów i utwórz ankietę spotkania.";
  }

  if (action === "publish") {
    return "Ankieta została utworzona i zapisana lokalnie w sesji przeglądarki.";
  }

  if (action === "vote") {
    return "Twój głos został zapisany lokalnie w podglądzie spotkania.";
  }

  if (action === "finalize") {
    return "Prowadzący zatwierdził finalny termin spotkania.";
  }

  if (action === "load") {
    return "Wczytujemy podgląd spotkania.";
  }

  return "Gotowe do pracy.";
}

function sortSlotsByVotes(slots: MeetingPollSlot[]) {
  return [...slots].sort((left, right) => right.votesCount - left.votesCount);
}

export {
  buildMeetingFromDraft,
  buildStorageKey,
  createDemoMeeting,
  createEmptySlotDraft,
  createMeetingId,
  getNextStatusMessage,
  loadStoredMeeting,
  persistMeeting,
};

export default function MeetingPollWorkspace({ clubId, clubName, mode, meetingId }: MeetingPollWorkspaceProps) {
  const resolvedMeetingId = meetingId ?? "preview-meeting";
  const storageKey = useMemo(() => buildStorageKey(clubId, resolvedMeetingId), [clubId, resolvedMeetingId]);
  const [isHydrated, setIsHydrated] = useState(mode === "create");
  const [viewerRole, setViewerRole] = useState<MeetingPollRole>("host");
  const [statusMessage, setStatusMessage] = useState(getNextStatusMessage(mode === "create" ? "create" : "load"));
  const [meetingDraft, setMeetingDraft] = useState<MeetingPollDraft>(EMPTY_MEETING_DRAFT);
  const [slotDrafts, setSlotDrafts] = useState<MeetingSlotDraft[]>([createEmptySlotDraft(0), createEmptySlotDraft(1)]);
  const [publishedMeetingId, setPublishedMeetingId] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<MeetingPoll>(() =>
    mode === "detail" ? createDemoMeeting(clubId, clubName, resolvedMeetingId) : createDemoMeeting(clubId, clubName, "draft"),
  );

  useEffect(() => {
    if (mode !== "detail") {
      return;
    }

    const storedMeeting = loadStoredMeeting(clubId, resolvedMeetingId) ?? createDemoMeeting(clubId, clubName, resolvedMeetingId);
    setMeeting(storedMeeting);
    setViewerRole(storedMeeting.currentUserRole);
    setStatusMessage(getNextStatusMessage("load"));
    setIsHydrated(true);
  }, [clubId, clubName, mode, resolvedMeetingId]);

  const currentMeeting = mode === "detail" ? meeting : buildMeetingFromDraft(clubId, clubName, "preview", meetingDraft, slotDrafts, viewerRole);
  const activeSlots = sortSlotsByVotes(currentMeeting.slots);
  const leadingSlot = activeSlots[0] ?? null;
  const totalVotes = currentMeeting.slots.reduce((sum, slot) => sum + slot.votesCount, 0);
  const canFinalize = viewerRole === "host" && currentMeeting.status !== "finalized";
  const currentMeetingLink = publishedMeetingId ? `/club/${clubId}/meetings/${publishedMeetingId}` : `/club/${clubId}/meetings/${resolvedMeetingId}`;

  function updateMeetingDraft(field: keyof MeetingPollDraft, value: string) {
    setMeetingDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateSlotDraft(index: number, field: SlotDraftField, value: string) {
    setSlotDrafts((currentDrafts) =>
      currentDrafts.map((draft, draftIndex) => (draftIndex === index ? { ...draft, [field]: value } : draft)),
    );
  }

  function addSlotDraft() {
    setSlotDrafts((currentDrafts) => [...currentDrafts, createEmptySlotDraft(currentDrafts.length)]);
    setStatusMessage("Dodano kolejny termin do ankiety.");
  }

  function removeSlotDraft(id: string) {
    setSlotDrafts((currentDrafts) => currentDrafts.filter((draft) => draft.id !== id));
    setStatusMessage("Usunięto termin z formularza.");
  }

  function publishMeeting() {
    const title = meetingDraft.title.trim();
    const description = meetingDraft.description.trim();
    const validSlotDrafts = slotDrafts.filter((draft) => draft.date.trim() && draft.time.trim());

    if (title.length < 3) {
      setStatusMessage("Tytuł ankiety musi mieć co najmniej 3 znaki.");
      return;
    }

    if (validSlotDrafts.length < 2) {
      setStatusMessage("Dodaj przynajmniej dwa terminy, zanim utworzysz ankietę.");
      return;
    }

    const nextMeetingId = createMeetingId();
    const nextMeeting = buildMeetingFromDraft(
      clubId,
      clubName,
      nextMeetingId,
      {
        title,
        description,
      },
      validSlotDrafts,
      viewerRole,
    );

    persistMeeting(nextMeeting);
    setMeeting(nextMeeting);
    setPublishedMeetingId(nextMeetingId);
    setStatusMessage(getNextStatusMessage("publish"));
  }

  function handleSlotAdded(slot: any) {
    const nextMeeting: MeetingPoll = {
      ...meeting,
      slots: [
        ...meeting.slots,
        {
          id: slot.id,
          label: slot.label,
          startLabel: slot.startLabel,
          endLabel: slot.endLabel ?? "Brak czasu zakończenia",
          votesCount: 0,
          currentUserHasVoted: false,
          createdByIsCurrentUser: true,
          createdByLabel: "Ty",
        },
      ],
      updatedAtLabel: getTodayLabel(),
    } as MeetingPoll;

    setMeeting(nextMeeting);
    setStatusMessage("Dodano propozycję terminu.");
    if (mode === "detail") persistMeeting(nextMeeting);
  }

  function handleVote(slotId: string) {
    if (currentMeeting.status === "finalized") {
      setStatusMessage("Nie można zmienić głosu po finalizacji terminu.");
      return;
    }
    const previousVoteId = currentMeeting.currentUserVoteSlotId;
    const nextVoteId = previousVoteId === slotId ? null : slotId;

    const optimisticMeeting: MeetingPoll = {
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
    };

    // optimistic update
    setMeeting(optimisticMeeting);
    setStatusMessage(getNextStatusMessage("vote"));
    if (mode === "detail") persistMeeting(optimisticMeeting);

    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token ?? null;

        if (!token) {
          // no auth: keep optimistic local-only state
          setStatusMessage("Zapis lokalny wykonany — zaloguj się, aby zapisać na serwerze.");
          return;
        }

        if (nextVoteId) {
          // cast vote
          const res = await fetch("/api/meeting-votes", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ meetingId: meeting.id, slotId: nextVoteId }),
          });

          const payload = await res.json().catch(() => null);

          if (!res.ok || (payload && payload.ok === false)) {
            // rollback
            setMeeting(currentMeeting);
            setStatusMessage(payload?.message ?? "Nie udało się zapisać głosu na serwerze.");
            if (mode === "detail") persistMeeting(currentMeeting);
          }
        } else {
          // remove vote
          const res = await fetch(`/api/meeting-votes?meetingId=${encodeURIComponent(meeting.id)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          const payload = await res.json().catch(() => null);
          if (!res.ok || (payload && payload.ok === false)) {
            // rollback
            setMeeting(currentMeeting);
            setStatusMessage(payload?.message ?? "Nie udało się usunąć głosu na serwerze.");
            if (mode === "detail") persistMeeting(currentMeeting);
          }
        }
      } catch {
        // network error -> keep optimistic local state but inform user
        setStatusMessage("Błąd sieci — głos zapisano lokalnie.");
      }
    })();
  }

  function finalizeMeeting(slotId: string) {
    if (!canFinalize) {
      setStatusMessage("Tylko prowadzący może zatwierdzić finalny termin.");
      return;
    }

    const nextMeeting: MeetingPoll = {
      ...currentMeeting,
      status: "finalized",
      finalizedSlotId: slotId,
      updatedAtLabel: getTodayLabel(),
    };

    setMeeting(nextMeeting);
    setStatusMessage(getNextStatusMessage("finalize"));

    if (mode === "detail") {
      persistMeeting(nextMeeting);
    }
  }

  function removeSlot(slotId: string) {
    const slot = meeting.slots.find((s) => s.id === slotId);
    if (!slot) {
      setStatusMessage("Nie znaleziono terminu.");
      return;
    }

    const isCreator = slot.createdByIsCurrentUser === true;
    if (!(viewerRole === "host" || isCreator)) {
      setStatusMessage("Nie masz uprawnień do usunięcia tego terminu.");
      return;
    }

    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token ?? null;

        if (token) {
          const res = await fetch(`/api/meeting-slots?slotId=${encodeURIComponent(slotId)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          const payload = await res.json().catch(() => null);
          if (!res.ok || (payload && payload.ok === false)) {
            setStatusMessage(payload?.message ?? "Nie udało się usunąć propozycji na serwerze. Użyto lokalnego trybu.");
          }
        }
      } catch {
        // ignore and fallback to local removal
      }

      const nextMeeting: MeetingPoll = {
        ...meeting,
        slots: meeting.slots.filter((s) => s.id !== slotId),
        updatedAtLabel: getTodayLabel(),
      } as MeetingPoll;

      setMeeting(nextMeeting);
      setStatusMessage("Usunięto termin.");
      if (mode === "detail") persistMeeting(nextMeeting);
    })();
  }

  if (mode === "detail" && !isHydrated) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 px-6 py-8 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Spotkanie</p>
        <p className="mt-3 text-base leading-7 text-slate-600">Wczytujemy podgląd spotkania…</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 px-6 py-8 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              {mode === "create" ? "Stage 14 · tworzenie ankiety" : "Stage 14 · podgląd spotkania"}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{currentMeeting.title}</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">{currentMeeting.description || "Dodaj krótki opis spotkania lub zostaw go jako notatkę pomocniczą."}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              {currentMeeting.status === "draft"
                ? "Szkic"
                : currentMeeting.status === "open"
                  ? "Otwarte głosowanie"
                  : currentMeeting.status === "closed"
                    ? "Zamknięte"
                    : "Finalny termin"}
            </span>
            <span className="inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              {viewerRole === "host" ? "Widok prowadzącego" : "Widok członka"}
            </span>
          </div>
        </div>

        {/* Header action buttons removed per design: podgląd prowadzącego → lista członków */}

        <div aria-live="polite" className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
          {statusMessage}
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Członkostwo</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{clubName}</dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Głosy</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{totalVotes} oddanych głosów</dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Data aktualizacji</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{currentMeeting.updatedAtLabel}</dd>
          </div>
        </dl>
      </section>

      {mode === "create" ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <form
            className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8"
            onSubmit={(event) => {
              event.preventDefault();
              publishMeeting();
            }}
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Formularz</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Dodaj nową ankietę spotkania</h3>
            </div>

            <div className="mt-6 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Tytuł spotkania</span>
                <input
                  value={meetingDraft.title}
                  onChange={(event) => updateMeetingDraft("title", event.target.value)}
                  type="text"
                  placeholder="Na przykład: Spotkanie marcowe"
                  className="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/15"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Opis</span>
                <textarea
                  value={meetingDraft.description}
                  onChange={(event) => updateMeetingDraft("description", event.target.value)}
                  rows={4}
                  placeholder="Dodaj krótką notatkę dla członków klubu"
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/15"
                />
              </label>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">Proponowane terminy</p>
                <p className="text-sm leading-6 text-slate-500">Dodaj przynajmniej dwa sloty, aby utworzyć ankietę.</p>
              </div>
              <button
                type="button"
                onClick={addSlotDraft}
                className="inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
              >
                Dodaj termin
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {slotDrafts.map((slotDraft, index) => (
                <article key={slotDraft.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">Termin {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeSlotDraft(slotDraft.id)}
                      disabled={slotDrafts.length <= 2}
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
                    >
                      Usuń
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 sm:col-span-2">
                      <span className="text-sm font-semibold text-slate-700">Etykieta terminu</span>
                      <input
                        value={slotDraft.label}
                        onChange={(event) => updateSlotDraft(index, "label", event.target.value)}
                        type="text"
                        placeholder="Na przykład: Wtorkowy wieczór"
                        className="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/15"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-slate-700">Data</span>
                      <input
                        value={slotDraft.date}
                        onChange={(event) => updateSlotDraft(index, "date", event.target.value)}
                        type="date"
                        className="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/15"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-slate-700">Godzina startu</span>
                      <input
                        value={slotDraft.time}
                        onChange={(event) => updateSlotDraft(index, "time", event.target.value)}
                        type="time"
                        className="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/15"
                      />
                    </label>

                    <label className="grid gap-2 sm:col-span-2">
                      <span className="text-sm font-semibold text-slate-700">Godzina zakończenia (opcjonalnie)</span>
                      <input
                        value={slotDraft.endTime}
                        onChange={(event) => updateSlotDraft(index, "endTime", event.target.value)}
                        type="time"
                        className="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/15"
                      />
                    </label>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
              >
                Utwórz ankietę
              </button>
              <Link
                href={`/club/${clubId}`}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
              >
                Anuluj
              </Link>
            </div>
          </form>

          <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Podgląd</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Ankieta przed publikacją</h3>
              </div>
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                {slotDrafts.length} terminów
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {currentMeeting.slots.map((slot, index) => (
                <article key={slot.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{slot.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{slot.startLabel}</p>
                      <p className="text-sm leading-6 text-slate-500">{slot.endLabel}</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                      Slot {index + 1}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              Po publikacji ankieta trafi do lokalnej sesji przeglądarki. Link do szczegółów pojawi się tutaj od razu po zapisaniu.
            </div>

            {publishedMeetingId ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
                <p className="font-semibold">Ankieta została zapisana.</p>
                <p className="mt-1">Możesz otworzyć szczegóły spotkania w nowym widoku.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={currentMeetingLink}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-900/20"
                  >
                    Otwórz szczegóły
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMeetingDraft(EMPTY_MEETING_DRAFT);
                      setSlotDrafts([createEmptySlotDraft(0), createEmptySlotDraft(1)]);
                      setPublishedMeetingId(null);
                      setStatusMessage("Formularz został wyczyszczony i jest gotowy do kolejnej ankiety.");
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-900/20"
                  >
                    Utwórz kolejną
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </section>
      ) : (
        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Głosowanie</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Wybierz najlepszy termin</h3>
            </div>
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              {currentMeeting.status}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {currentMeeting.slots.map((slot) => {
              const isLeading = leadingSlot?.id === slot.id;
              const isFinalized = currentMeeting.finalizedSlotId === slot.id;
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
                      onClick={() => handleVote(slot.id)}
                      disabled={currentMeeting.status === "finalized"}
                      aria-pressed={slot.currentUserHasVoted}
                      aria-label={slot.currentUserHasVoted ? `Cofnij głos dla ${slot.label}` : `Zagłosuj na ${slot.label}`}
                      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-950/20 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${
                        slot.currentUserHasVoted
                          ? "border border-slate-950 bg-slate-950 text-white hover:bg-slate-800"
                          : "border border-slate-300 bg-white text-slate-950 hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {slot.currentUserHasVoted ? "Twój wybór" : "Zagłosuj"}
                    </button>

                    {canFinalize ? (
                      <button
                        type="button"
                        onClick={() => finalizeMeeting(slot.id)}
                        className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-900/20"
                      >
                        Zatwierdź termin
                      </button>
                    ) : null}

                    {(viewerRole === "host" || slot.createdByIsCurrentUser) ? (
                      <button
                        type="button"
                        onClick={() => removeSlot(slot.id)}
                        className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-900 transition hover:border-red-300 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-900/20"
                      >
                        Usuń termin
                      </button>
                    ) : null}
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
            })}
          </div>

          <div className="mt-6">
            <MeetingSlotForm clubId={clubId} meetingId={meeting.id} onAdded={handleSlotAdded} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-900">Najlepszy termin</p>
              <p className="mt-1">{leadingSlot ? leadingSlot.label : "Brak głosów"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-900">Twój głos</p>
              <p className="mt-1">{currentMeeting.currentUserVoteSlotId ? "Masz zapisany wybór" : "Nie zagłosowano jeszcze"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-900">Stan ankiety</p>
              <p className="mt-1">{currentMeeting.status === "finalized" ? "Termin potwierdzony" : "Ankieta nadal otwarta"}</p>
            </div>
          </div>

          {currentMeeting.status === "finalized" && currentMeeting.finalizedSlotId ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
              <p className="font-semibold">Finalny termin został ustawiony.</p>
              <p className="mt-1">
                Wybrano: {currentMeeting.slots.find((slot) => slot.id === currentMeeting.finalizedSlotId)?.label ?? "nieznany termin"}.
              </p>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "../../../lib/supabase.browser";
import ProposalCard from "./ProposalCard";
import ProposalForm from "./ProposalForm";
import {
  PROPOSAL_DESCRIPTION_MAX_LENGTH,
  type BookProposal,
  type ProposalDraft,
  type ProposalFieldErrors,
} from "./types";

type ProposalListProps = {
  clubId: string;
  clubName: string;
  initialProposals?: BookProposal[];
  userCanManageProposals?: boolean;
  splitColumns?: boolean;
};

type ProposalsApiResponse =
  | {
      ok: true;
      status: 200;
      clubId: string;
      items: BookProposal[];
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

type ProposalMutationResponse =
  | {
      ok: true;
      status: 200 | 201;
      message: string;
      proposal: BookProposal;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

type ProposalDeleteResponse =
  | {
      ok: true;
      status: 200;
      message: string;
      proposalId: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

type VoteMutationResponse =
  | {
      ok: true;
      status: 200 | 201;
      message: string;
      proposalId: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

const EMPTY_DRAFT: ProposalDraft = {
  title: "",
  author: "",
  coverImageFile: null,
  coverImageName: "",
  coverImagePreviewUrl: "",
  description: "",
};

const EMPTY_INITIAL_PROPOSALS: BookProposal[] = [];

function buildStatusMessage(action: "add" | "edit" | "delete" | "reset") {
  if (action === "add") {
    return "Propozycja została dodana lokalnie do listy.";
  }

  if (action === "edit") {
    return "Propozycja została zaktualizowana lokalnie.";
  }

  if (action === "delete") {
    return "Propozycja została usunięta z tej listy.";
  }

  if (action === "vote") {
    return "Głos został zapisany lokalnie na tej karcie propozycji.";
  }

  return "Formularz został wyczyszczony.";
}

function validateDraft(draft: ProposalDraft) {
  const nextErrors: ProposalFieldErrors = {};
  const title = draft.title.trim();
  const author = draft.author.trim();
  const description = draft.description.trim();

  if (title.length < 3) {
    nextErrors.title = "Tytuł musi mieć co najmniej 3 znaki.";
  }

  if (author.length < 2) {
    nextErrors.author = "Podaj co najmniej 2 znaki autora.";
  }

  if (description.length > PROPOSAL_DESCRIPTION_MAX_LENGTH) {
    nextErrors.description = `Opis może mieć maksymalnie ${PROPOSAL_DESCRIPTION_MAX_LENGTH} znaków.`;
  }

  return nextErrors;
}

function getCountLabel(count: number) {
  if (count === 1) {
    return "1 propozycja";
  }

  return `${count} propozycje`;
}

function normalizeProposalVotes(proposal: BookProposal): BookProposal {
  return {
    ...proposal,
    votesCount: proposal.votesCount ?? 0,
    currentUserHasVoted: proposal.currentUserHasVoted ?? false,
  };
}

export default function ProposalList({
  clubId,
  clubName,
  initialProposals = EMPTY_INITIAL_PROPOSALS,
  userCanManageProposals = true,
  splitColumns = false,
}: ProposalListProps) {
  const [proposals, setProposals] = useState<BookProposal[]>(initialProposals);
  const [draft, setDraft] = useState<ProposalDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<ProposalFieldErrors>({});
  const [statusMessage, setStatusMessage] = useState("Dodaj propozycje książek dla tego klubu.");
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [voteProposalId, setVoteProposalId] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const coverObjectUrlRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  const accessTokenRef = useRef<string | null>(null);

  const getAccessToken = useCallback(async () => {
    if (accessTokenRef.current) {
      return accessTokenRef.current;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;

      accessTokenRef.current = token;

      return token;
    } catch {
      return null;
    }
  }, []);

  const refreshProposals = useCallback(async (options?: { showLoading?: boolean; message?: string }) => {
    if (options?.showLoading) {
      setIsLoading(true);
    }

    setStatusMessage("Wczytujemy propozycje książek...");

    try {
      const token = await getAccessToken();

      if (!isMountedRef.current) {
        return false;
      }

      accessTokenRef.current = token;

      if (!token) {
        setStatusMessage("Zaloguj się, aby zobaczyć propozycje książek.");
        setProposals(initialProposals);
        return false;
      }

      const response = await fetch(`/api/book-proposals?clubId=${encodeURIComponent(clubId)}`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = (await response.json()) as ProposalsApiResponse;

      if (!isMountedRef.current) {
        return false;
      }

      if (!response.ok || !payload.ok) {
        setStatusMessage(payload.message ?? "Nie udało się wczytać propozycji książek.");
        setProposals(initialProposals);
        return false;
      }

      setProposals(payload.items.map(normalizeProposalVotes));
      setStatusMessage(
        options?.message ??
          (payload.items.length > 0
            ? "Propozycje książek są gotowe."
            : "Dodaj pierwszą książkę, aby rozpocząć listę do głosowania."),
      );

      return true;
    } catch {
      if (isMountedRef.current) {
        setStatusMessage("Nie udało się wczytać propozycji książek. Spróbuj ponownie.");
        setProposals(initialProposals);
      }

      return false;
    } finally {
      if (options?.showLoading && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [clubId, getAccessToken, initialProposals]);

  useEffect(() => {
    isMountedRef.current = true;

    const timeoutId = window.setTimeout(() => {
      void refreshProposals({ showLoading: true });
    }, 0);

    return () => {
      isMountedRef.current = false;
      window.clearTimeout(timeoutId);

      if (coverObjectUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(coverObjectUrlRef.current);
      }
    };
  }, [refreshProposals]);

  const isEditing = editingProposalId !== null;
  const remainingCharacters = PROPOSAL_DESCRIPTION_MAX_LENGTH - draft.description.length;

  function buildProposalFormData() {
    const formData = new FormData();
    const title = draft.title.trim();
    const author = draft.author.trim();
    const description = draft.description.trim();

    formData.set("clubId", clubId);
    formData.set("title", title);
    formData.set("author", author);
    formData.set("description", description);

    if (draft.coverImageFile) {
      formData.set("coverImageFile", draft.coverImageFile);
    } else {
      formData.set("coverImageUrl", draft.coverImagePreviewUrl.trim());
      formData.set("coverImageName", draft.coverImageName.trim());
    }

    return formData;
  }

  async function requestCreateProposal() {
    const token = await getAccessToken();

    if (!token) {
      return {
        ok: false as const,
        status: 401,
        message: "Zaloguj się, aby dodać propozycję książki.",
      };
    }

    const response = await fetch("/api/book-proposals", {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: buildProposalFormData(),
    });

    return (await response.json()) as ProposalMutationResponse;
  }

  async function requestUpdateProposal(proposalId: string) {
    const token = await getAccessToken();

    if (!token) {
      return {
        ok: false as const,
        status: 401,
        message: "Zaloguj się ponownie, aby zapisać zmiany.",
      };
    }

    const response = await fetch(`/api/book-proposals/${proposalId}`, {
      method: "PATCH",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: buildProposalFormData(),
    });

    return (await response.json()) as ProposalMutationResponse;
  }

  async function requestDeleteProposal(proposalId: string) {
    const token = await getAccessToken();

    if (!token) {
      return {
        ok: false as const,
        status: 401,
        message: "Zaloguj się ponownie, aby usunąć propozycję.",
      };
    }

    const response = await fetch(`/api/book-proposals/${proposalId}`, {
      method: "DELETE",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return (await response.json()) as ProposalDeleteResponse;
  }

  function updateField<K extends keyof ProposalDraft>(field: K, value: ProposalDraft[K]) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function handleCoverSelect(file: File | null) {
    if (coverObjectUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(coverObjectUrlRef.current);
      coverObjectUrlRef.current = null;
    }

    if (!file) {
      setDraft((current) => ({
        ...current,
        coverImageFile: null,
        coverImageName: "",
        coverImagePreviewUrl: "",
      }));
      setStatusMessage("Usunięto grafikę okładki.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    coverObjectUrlRef.current = previewUrl;

    setDraft((current) => ({
      ...current,
      coverImageFile: file,
      coverImageName: file.name,
      coverImagePreviewUrl: previewUrl,
    }));

    setStatusMessage(`Dołączono grafikę okładki: ${file.name}`);
  }

  function resetForm(message = buildStatusMessage("reset")) {
    if (coverObjectUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(coverObjectUrlRef.current);
      coverObjectUrlRef.current = null;
    }

    setDraft(EMPTY_DRAFT);
    setErrors({});
    setEditingProposalId(null);
    setStatusMessage(message);
    titleInputRef.current?.focus();
  }

  function startEdit(proposal: BookProposal) {
    if (coverObjectUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(coverObjectUrlRef.current);
      coverObjectUrlRef.current = null;
    }

    setDraft({
      title: proposal.title,
      author: proposal.author,
      coverImageFile: null,
      coverImageName: proposal.coverImageName ?? "",
      coverImagePreviewUrl: proposal.coverImageUrl ?? "",
      description: proposal.description,
    });
    setErrors({});
    setEditingProposalId(proposal.id);
    setStatusMessage(`Edytujesz propozycję: ${proposal.title}.`);
    titleInputRef.current?.focus();
  }

  function handleToggleVote(proposalId: string) {
    if (isSubmitting || isLoading || voteProposalId) {
      return;
    }

    void (async () => {
      const proposal = proposals.find((item) => item.id === proposalId);

      if (!proposal) {
        return;
      }

      const nextHasVoted = !proposal.currentUserHasVoted;

      setVoteProposalId(proposalId);
      setProposals((current) =>
        current.map((currentProposal) => {
          if (currentProposal.id !== proposalId) {
            return currentProposal;
          }

          const currentUserHasVoted = currentProposal.currentUserHasVoted ?? false;
          const nextVotesCount = Math.max(0, (currentProposal.votesCount ?? 0) + (currentUserHasVoted ? -1 : 1));

          return {
            ...currentProposal,
            votesCount: nextVotesCount,
            currentUserHasVoted: !currentUserHasVoted,
          };
        }),
      );
      setStatusMessage(nextHasVoted ? "Zapisujemy głos..." : "Usuwamy głos...");

      try {
        const token = await getAccessToken();

        if (!token) {
          setStatusMessage("Zaloguj się ponownie, aby głosować.");
          await refreshProposals({ message: "Zaloguj się ponownie, aby głosować." });
          return;
        }

        const response = await fetch("/api/votes", {
          method: nextHasVoted ? "POST" : "DELETE",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ proposalId }),
        });

        const payload = (await response.json()) as VoteMutationResponse;

        if (!response.ok || !payload.ok) {
          throw new Error(payload.message ?? "Nie udało się zapisać głosu.");
        }

        await refreshProposals({ message: payload.message });
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Nie udało się zapisać głosu. Spróbuj ponownie.");
        await refreshProposals({ message: "Nie udało się zapisać głosu. Spróbuj ponownie." });
      } finally {
        setVoteProposalId(null);
      }
    })();
  }

  async function handleDelete(proposalId: string) {
    setIsSubmitting(true);
    setStatusMessage("Usuwamy propozycję...");

    try {
      const result = await requestDeleteProposal(proposalId);

      if (!result.ok) {
        setStatusMessage(result.message);
        return;
      }

      if (editingProposalId === proposalId) {
        setDraft(EMPTY_DRAFT);
        setErrors({});
        setEditingProposalId(null);
      }

      await refreshProposals({ message: result.message });
    } catch {
      setStatusMessage("Nie udało się usunąć propozycji. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      setStatusMessage("Poczekaj, aż propozycje książek zostaną wczytane.");
      return;
    }

    const nextErrors = validateDraft(draft);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatusMessage("Popraw pola zaznaczone poniżej i spróbuj ponownie.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = editingProposalId
        ? await requestUpdateProposal(editingProposalId)
        : await requestCreateProposal();

      if (!result.ok) {
        setStatusMessage(result.message);
        return;
      }

      setEditingProposalId(null);
      setDraft(EMPTY_DRAFT);
      setErrors({});
      await refreshProposals({ message: result.message });
    } catch {
      setStatusMessage(editingProposalId ? "Nie udało się zaktualizować propozycji." : "Nie udało się dodać propozycji.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Lista propozycji i głosowanie</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
            {getCountLabel(proposals.length)}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
          Wczytujemy propozycje książek...
        </div>
      ) : null}

      {splitColumns ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,20rem)_1fr] items-start">
          <div className="w-full sm:max-w-[20rem]">
            <div className="w-full space-y-4">
              <ProposalForm
                clubName={clubName}
                draft={draft}
                errors={errors}
                statusMessage={statusMessage}
                isEditing={isEditing}
                isLoading={isLoading}
                isSubmitting={isSubmitting}
                charactersLeft={remainingCharacters}
                titleInputRef={titleInputRef}
                onChange={updateField}
                onCoverSelect={handleCoverSelect}
                onSubmit={handleSubmit}
                onCancel={() => resetForm("Edycja została anulowana.")}
                onClear={() => resetForm()}
              />

              
            </div>
          </div>

          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {proposals.length > 0 ? (
                proposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    title={proposal.title}
                    author={proposal.author}
                    coverImageUrl={proposal.coverImageUrl}
                    coverImageName={proposal.coverImageName}
                    description={proposal.description}
                    createdByLabel={proposal.createdByLabel}
                    createdAt={proposal.createdAt}
                    updatedAt={proposal.updatedAt}
                    canManage={userCanManageProposals && (proposal.canManage || proposal.canEdit || proposal.canDelete)}
                    votesCount={proposal.votesCount ?? 0}
                    currentUserHasVoted={proposal.currentUserHasVoted ?? false}
                    isVotePending={voteProposalId === proposal.id}
                    onEdit={() => startEdit(proposal)}
                    onDelete={() => handleDelete(proposal.id)}
                    onVote={() => handleToggleVote(proposal.id)}
                  />
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
                  <p className="font-semibold text-slate-900">Brak propozycji</p>
                  <p className="mt-2">Dodaj pierwszą książkę w formularzu po lewej stronie.</p>
                  <button
                    type="button"
                    onClick={() => titleInputRef.current?.focus()}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
                  >
                    Dodaj pierwszą propozycję
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <ProposalForm
            clubName={clubName}
            draft={draft}
            errors={errors}
            statusMessage={statusMessage}
            isEditing={isEditing}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            charactersLeft={remainingCharacters}
            titleInputRef={titleInputRef}
            onChange={updateField}
            onCoverSelect={handleCoverSelect}
            onSubmit={handleSubmit}
            onCancel={() => resetForm("Edycja została anulowana.")}
            onClear={() => resetForm()}
          />
          

          <div className="grid gap-4 sm:grid-cols-2">
            {proposals.length > 0 ? (
              proposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  title={proposal.title}
                  author={proposal.author}
                  coverImageUrl={proposal.coverImageUrl}
                  coverImageName={proposal.coverImageName}
                  description={proposal.description}
                  createdByLabel={proposal.createdByLabel}
                  createdAt={proposal.createdAt}
                  updatedAt={proposal.updatedAt}
                  canManage={userCanManageProposals && (proposal.canManage || proposal.canEdit || proposal.canDelete)}
                  votesCount={proposal.votesCount ?? 0}
                  currentUserHasVoted={proposal.currentUserHasVoted ?? false}
                  isVotePending={voteProposalId === proposal.id}
                  onEdit={() => startEdit(proposal)}
                  onDelete={() => handleDelete(proposal.id)}
                  onVote={() => handleToggleVote(proposal.id)}
                />
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
                <p className="font-semibold text-slate-900">Brak propozycji</p>
                <p className="mt-2">
                  Dodaj pierwszą książkę w formularzu po lewej stronie, a potem zagłosuj na nią bez opuszczania tego ekranu.
                </p>
                <button
                  type="button"
                  onClick={() => titleInputRef.current?.focus()}
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
                >
                  Dodaj pierwszą propozycję
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {!userCanManageProposals ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
          W tym widoku nie masz uprawnień do zarządzania propozycjami. Formularz pozostaje widoczny jako podgląd
          Stage 12.
        </p>
      ) : null}
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
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

const EMPTY_DRAFT: ProposalDraft = {
  title: "",
  author: "",
  coverImageFile: null,
  coverImageName: "",
  coverImagePreviewUrl: "",
  description: "",
};

const EMPTY_INITIAL_PROPOSALS: BookProposal[] = [];

function createProposalId() {
  return `proposal-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Nie udało się wczytać grafiki okładki."));
    };

    reader.onerror = () => reject(new Error("Nie udało się wczytać grafiki okładki."));
    reader.readAsDataURL(file);
  });
}

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

function buildProposal(clubId: string, draft: ProposalDraft, canManage: boolean): BookProposal {
  const timestamp = new Date().toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return {
    id: createProposalId(),
    title: draft.title.trim(),
    author: draft.author.trim(),
    coverImageUrl: draft.coverImagePreviewUrl.trim(),
    coverImageName: draft.coverImageName.trim(),
    description: draft.description.trim(),
    createdBy: clubId,
    createdByLabel: "Ty",
    createdAt: timestamp,
    updatedAt: timestamp,
    canManage,
    canEdit: canManage,
    canDelete: canManage,
  };
}

export default function ProposalList({
  clubId,
  clubName,
  initialProposals = EMPTY_INITIAL_PROPOSALS,
  userCanManageProposals = true,
}: ProposalListProps) {
  const [proposals, setProposals] = useState<BookProposal[]>(initialProposals);
  const [draft, setDraft] = useState<ProposalDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<ProposalFieldErrors>({});
  const [statusMessage, setStatusMessage] = useState("Dodaj propozycje książek dla tego klubu.");
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const coverObjectUrlRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  async function refreshProposals(options?: { showLoading?: boolean; message?: string }) {
    if (options?.showLoading) {
      setIsLoading(true);
    }

    setStatusMessage("Wczytujemy propozycje książek...");

    try {
      const token = await getAccessToken();

      if (!isMountedRef.current) {
        return false;
      }

      setAccessToken(token);

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

      setProposals(payload.items);
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
  }

  useEffect(() => {
    isMountedRef.current = true;

    void refreshProposals({ showLoading: true });

    return () => {
      isMountedRef.current = false;

      if (coverObjectUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(coverObjectUrlRef.current);
      }
    };
  }, [clubId, initialProposals]);

  const isEditing = editingProposalId !== null;
  const remainingCharacters = PROPOSAL_DESCRIPTION_MAX_LENGTH - draft.description.length;

  async function getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;

      setAccessToken(token);

      return token;
    } catch {
      return null;
    }
  }

  function buildProposalPayload(overrides: Partial<ProposalDraft> = {}) {
    return {
      title: (overrides.title ?? draft.title).trim(),
      author: (overrides.author ?? draft.author).trim(),
      description: (overrides.description ?? draft.description).trim(),
      coverImageUrl: (overrides.coverImagePreviewUrl ?? draft.coverImagePreviewUrl).trim(),
      coverImageName: (overrides.coverImageName ?? draft.coverImageName).trim(),
    };
  }

  async function uploadCoverIfNeeded() {
    if (draft.coverImageFile) {
      return {
        coverImageUrl: await fileToDataUrl(draft.coverImageFile),
        coverImageName: draft.coverImageFile.name,
      };
    }

    return {
      coverImageUrl: draft.coverImagePreviewUrl.trim(),
      coverImageName: draft.coverImageName.trim(),
    };
  }

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
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Stage 12</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Lista propozycji</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
            {getCountLabel(proposals.length)}
          </span>
        </div>
        <p className="text-sm leading-6 text-slate-600">
          Ten widok działa lokalnie i pokazuje, jak będzie wyglądać etap zbierania propozycji książek dla klubu {clubName}.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
          Wczytujemy propozycje książek...
        </div>
      ) : null}

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

      <div className="space-y-4">
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
              onEdit={() => startEdit(proposal)}
              onDelete={() => handleDelete(proposal.id)}
            />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-slate-900">Brak propozycji</p>
            <p className="mt-2">Dodaj pierwszą książkę w formularzu po lewej stronie, aby rozpocząć listę do głosowania.</p>
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

      {!userCanManageProposals ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
          W tym widoku nie masz uprawnień do zarządzania propozycjami. Formularz pozostaje widoczny jako podgląd
          Stage 12.
        </p>
      ) : null}
    </section>
  );
}

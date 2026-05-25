"use client";

import { useEffect, useRef, useState } from "react";
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

const EMPTY_DRAFT: ProposalDraft = {
  title: "",
  author: "",
  coverImageFile: null,
  coverImageName: "",
  coverImagePreviewUrl: "",
  description: "",
};

function createProposalId() {
  return `proposal-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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
  };
}

export default function ProposalList({
  clubId,
  clubName,
  initialProposals = [],
  userCanManageProposals = true,
}: ProposalListProps) {
  const [proposals, setProposals] = useState<BookProposal[]>(initialProposals);
  const [draft, setDraft] = useState<ProposalDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<ProposalFieldErrors>({});
  const [statusMessage, setStatusMessage] = useState("Dodaj propozycje książek dla tego klubu.");
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProposals(initialProposals);
  }, [initialProposals]);

  const isEditing = editingProposalId !== null;
  const remainingCharacters = PROPOSAL_DESCRIPTION_MAX_LENGTH - draft.description.length;

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

    setDraft((current) => ({
      ...current,
      coverImageFile: file,
      coverImageName: file.name,
      coverImagePreviewUrl: previewUrl,
    }));

    setStatusMessage(`Dołączono grafikę okładki: ${file.name}`);
  }

  function resetForm(message = buildStatusMessage("reset")) {
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setEditingProposalId(null);
    setStatusMessage(message);
    titleInputRef.current?.focus();
  }

  function startEdit(proposal: BookProposal) {
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

  function handleDelete(proposalId: string) {
    setProposals((current) => current.filter((proposal) => proposal.id !== proposalId));
    setStatusMessage(buildStatusMessage("delete"));

    setEditingProposalId((currentEditingId) => {
      if (currentEditingId === proposalId) {
        setDraft(EMPTY_DRAFT);
        setErrors({});
        return null;
      }

      return currentEditingId;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateDraft(draft);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatusMessage("Popraw pola zaznaczone poniżej i spróbuj ponownie.");
      return;
    }

    setIsSubmitting(true);

    setProposals((current) => {
      if (editingProposalId) {
        const existingProposal = current.find((proposal) => proposal.id === editingProposalId);

        if (!existingProposal) {
          return current;
        }

        const updatedProposal: BookProposal = {
          ...existingProposal,
          title: draft.title.trim(),
          author: draft.author.trim(),
          coverImageUrl: draft.coverImagePreviewUrl.trim(),
          coverImageName: draft.coverImageName.trim(),
          description: draft.description.trim(),
          updatedAt: new Date().toLocaleDateString("pl-PL", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
        };

        return current.map((proposal) => (proposal.id === editingProposalId ? updatedProposal : proposal));
      }

      return [buildProposal(clubId, draft, userCanManageProposals), ...current];
    });

    setEditingProposalId(null);
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setStatusMessage(buildStatusMessage(editingProposalId ? "edit" : "add"));
    setIsSubmitting(false);
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

      <ProposalForm
        clubName={clubName}
        draft={draft}
        errors={errors}
        statusMessage={statusMessage}
        isEditing={isEditing}
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
              canManage={userCanManageProposals && proposal.canManage}
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

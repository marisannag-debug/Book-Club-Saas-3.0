"use client";

import type { ProposalDraft, ProposalFieldErrors } from "./types";

type ProposalFormProps = {
  clubName: string;
  draft: ProposalDraft;
  errors: ProposalFieldErrors;
  statusMessage: string;
  isEditing: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  charactersLeft: number;
  titleInputRef: React.RefObject<HTMLInputElement | null>;
  onChange: <K extends keyof ProposalDraft>(field: K, value: ProposalDraft[K]) => void;
  onCoverSelect: (file: File | null) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onClear: () => void;
};

export default function ProposalForm({
  clubName,
  draft,
  errors,
  statusMessage,
  isEditing,
  isLoading,
  isSubmitting,
  charactersLeft,
  titleInputRef,
  onChange,
  onCoverSelect,
  onSubmit,
  onCancel,
  onClear,
}: ProposalFormProps) {
  const coverImagePreviewUrl = draft.coverImagePreviewUrl?.trim() ?? "";
  const hasCoverPreview = coverImagePreviewUrl.length > 0;
  const selectedFileLabel = draft.coverImageName || "Nie wybrano pliku";

  return (
    <form className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50 p-5" onSubmit={onSubmit} noValidate>
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Nowa książka</p>
        <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
          {isEditing ? "Edytuj propozycję" : `Dodaj propozycję do ${clubName}`}
        </h3>
        <p className="text-sm leading-6 text-slate-600">
          Uzupełnij tytuł, autora i opcjonalny opis. Zmiany zapisują się lokalnie w tym widoku.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="proposal-title" className="text-sm font-semibold text-slate-950">
          Tytuł książki
        </label>
        <input
          ref={titleInputRef}
          id="proposal-title"
          name="proposal-title"
          value={draft.title}
          onChange={(event) => onChange("title", event.target.value)}
          aria-invalid={Boolean(errors.title)}
          aria-describedby="proposal-title-help proposal-title-error"
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          placeholder="Na przykład: Normalni ludzie"
        />
        <p id="proposal-title-help" className="text-xs leading-5 text-slate-500">
          Krótki, konkretny tytuł pomoże szybko porównać propozycje.
        </p>
        <p id="proposal-title-error" aria-live="polite" className="min-h-5 text-sm text-red-600">
          {errors.title || "\u00A0"}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="proposal-author" className="text-sm font-semibold text-slate-950">
          Autor
        </label>
        <input
          id="proposal-author"
          name="proposal-author"
          value={draft.author}
          onChange={(event) => onChange("author", event.target.value)}
          aria-invalid={Boolean(errors.author)}
          aria-describedby="proposal-author-help proposal-author-error"
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          placeholder="Na przykład: Sally Rooney"
        />
        <p id="proposal-author-help" className="text-xs leading-5 text-slate-500">
          Możesz wpisać pełne imię i nazwisko albo samo nazwisko autora.
        </p>
        <p id="proposal-author-error" aria-live="polite" className="min-h-5 text-sm text-red-600">
          {errors.author || "\u00A0"}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="proposal-cover-image-file" className="text-sm font-semibold text-slate-950">
          Grafika okładki
        </label>
        <input
          id="proposal-cover-image-file"
          name="proposal-cover-image-file"
          type="file"
          accept="image/*"
          onChange={(event) => onCoverSelect(event.target.files?.[0] ?? null)}
          aria-describedby="proposal-cover-image-file-help"
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
        <p id="proposal-cover-image-file-help" className="text-xs leading-5 text-slate-500">
          Dołącz plik JPG, PNG, WEBP albo inny obraz. Podgląd pojawi się od razu poniżej.
        </p>
        <p className="text-xs font-medium leading-5 text-slate-500">Wybrany plik: {selectedFileLabel}</p>
        {hasCoverPreview ? (
          <div className="mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white sm:max-w-[18rem]">
            <img
              src={coverImagePreviewUrl}
              alt={`Podgląd okładki książki ${draft.title || "bez tytułu"}`}
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm leading-6 text-slate-500">
            Podgląd okładki pojawi się tutaj po dołączeniu pliku graficznego.
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="proposal-description" className="text-sm font-semibold text-slate-950">
            Opis propozycji
          </label>
          <span className="text-xs font-medium text-slate-500">{charactersLeft} znaków pozostało</span>
        </div>
        <textarea
          id="proposal-description"
          name="proposal-description"
          value={draft.description}
          onChange={(event) => onChange("description", event.target.value)}
          aria-invalid={Boolean(errors.description)}
          aria-describedby="proposal-description-help proposal-description-error"
          maxLength={280}
          className="min-h-32 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          placeholder="Dodaj 1-2 zdania o klimacie książki, tempie albo tematach do rozmowy"
        />
        <p id="proposal-description-help" className="text-xs leading-5 text-slate-500">
          Opis jest opcjonalny i może zostać pusty, jeśli chcesz tylko zebrać samą listę tytułów.
        </p>
        <p id="proposal-description-error" aria-live="polite" className="min-h-5 text-sm text-red-600">
          {errors.description || "\u00A0"}
        </p>
      </div>

      <div aria-live="polite" className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-700">
        {statusMessage || "Wypełnij formularz, aby dodać książkę do listy."}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
        >
          {isLoading ? "Wczytywanie..." : isSubmitting ? "Zapisywanie..." : isEditing ? "Zapisz zmiany" : "Dodaj propozycję"}
        </button>
        {isEditing ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
          >
            Anuluj edycję
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
        >
          Wyczyść formularz
        </button>
      </div>
    </form>
  );
}

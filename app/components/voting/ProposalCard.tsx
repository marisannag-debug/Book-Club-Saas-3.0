type ProposalCardProps = {
  title: string;
  author: string;
  coverImageUrl: string;
  coverImageName: string;
  description: string;
  createdByLabel: string;
  createdAt: string;
  updatedAt: string;
  canManage: boolean;
  votesCount: number;
  currentUserHasVoted: boolean;
  isVotePending: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onVote: () => void;
};

export default function ProposalCard({
  title,
  author,
  coverImageUrl,
  coverImageName,
  description,
  createdByLabel,
  createdAt,
  updatedAt,
  canManage,
  votesCount,
  currentUserHasVoted,
  isVotePending,
  onEdit,
  onDelete,
  onVote,
}: ProposalCardProps) {
  const hasCoverImage = coverImageUrl.trim().length > 0;
  const votesLabel = votesCount === 1 ? "1 głos" : `${votesCount} głosów`;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.28)]">
      {hasCoverImage ? (
        <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 w-full">
          <img src={coverImageUrl.trim()} alt={`Okładka książki ${title}`} className="aspect-[3/4] w-full object-cover" />
          <div className="border-t border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500">
            Dołączony plik: {coverImageName || "bez nazwy"}
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-sm leading-6 text-slate-500">
          Brak okładki. Możesz dołączyć plik z grafiką w formularzu po lewej stronie.
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Propozycja</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Autor: {author}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          {canManage ? "Do edycji" : "Tylko podgląd"}
        </span>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-600">{description || "Brak opisu tej propozycji."}</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Głosowanie</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{votesLabel}</p>
        </div>
        <button
          type="button"
          onClick={onVote}
          disabled={isVotePending}
          aria-pressed={currentUserHasVoted}
          aria-label={currentUserHasVoted ? `Cofnij głos dla ${title}` : `Głosuj na ${title}`}
          className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-950/20 ${
            currentUserHasVoted
              ? "border border-slate-950 bg-slate-950 text-white hover:bg-slate-800"
              : "border border-slate-300 bg-white text-slate-950 hover:border-slate-400 hover:bg-slate-50"
          } disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400`}
        >
          {isVotePending ? "Zapisywanie..." : currentUserHasVoted ? "Zagłosowano" : "Głosuj"}
        </button>
      </div>

      <dl className="mt-4 grid gap-3 text-xs leading-5 text-slate-500 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
          <dt className="font-semibold uppercase tracking-[0.18em] text-slate-400">Dodane przez</dt>
          <dd className="mt-1 text-sm font-medium text-slate-700">{createdByLabel}</dd>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
          <dt className="font-semibold uppercase tracking-[0.18em] text-slate-400">Data</dt>
          <dd className="mt-1 text-sm font-medium text-slate-700">
            Utworzono {createdAt}
            <br />
            Zmieniono {updatedAt}
          </dd>
        </div>
      </dl>

      {canManage ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
          >
            Edytuj
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            Usuń
          </button>
        </div>
      ) : (
        <p className="mt-5 text-sm leading-6 text-slate-500">
          Tylko autor lub prowadzący klubu mogą edytować tę propozycję.
        </p>
      )}
    </article>
  );
}

import Link from "next/link";
import ProposalList from "../../../../components/voting/ProposalList";
import { getClubDashboardById } from "../../../../../lib/club-dashboard.server";

type ClubVotingCreatePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClubVotingCreatePage({ params }: ClubVotingCreatePageProps) {
  const { id } = await params;
  const club = await getClubDashboardById(id);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.12),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <section className="rounded-[2rem] border border-slate-200 bg-white/85 px-6 py-8 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8 sm:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Voting flow</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Propozycje książek</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Zbierz książki, które trafią później do Stage 13. Na tym ekranie możesz dodawać, edytować i usuwać
            propozycje w lokalnym, frontendowym wariancie Stage 12.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Szybki formularz z tytułem, autorem i opisem opcjonalnym.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Lokalna lista z edycją i usuwaniem bez przeładowywania strony.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Gotowe źródło danych dla Stage 13, kiedy pojawi się pełne głosowanie.
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Klub</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{club.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{club.description}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              W Stage 12 skupiamy się na propozycjach książek. Głosowanie pojawi się w kolejnym etapie.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/club/${club.id}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              Wróć do klubu
            </Link>
            <Link
              href={`/club/${club.id}/members/manage`}
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              Lista członków
            </Link>
          </div>
        </section>

        <ProposalList clubId={club.id} clubName={club.name} />
      </div>
    </main>
  );
}

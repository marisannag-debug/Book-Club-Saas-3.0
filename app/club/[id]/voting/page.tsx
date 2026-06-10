import Link from "next/link";
import ProposalList from "../../../components/voting/ProposalList";
import { getClubDashboardById } from "../../../../lib/club-dashboard.server";

type ClubVotingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClubVotingPage({ params }: ClubVotingPageProps) {
  const { id } = await params;
  const club = await getClubDashboardById(id);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.12),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] border border-slate-200 bg-white/85 px-6 py-8 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8 sm:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Voting flow</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Propozycje książek i głosowanie</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Na tym ekranie dodajesz nową propozycję i od razu możesz zagłosować na dowolną kartę bez opuszczania
            widoku.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Szybki formularz z tytułem, autorem i opisem opcjonalnym.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Karta propozycji zawiera licznik głosów i przycisk głosowania.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Nowa propozycja od razu trafia do tej samej listy i może zebrać pierwszy głos.
            </div>
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

        <div className="mt-8">
          <ProposalList clubId={club.id} clubName={club.name} splitColumns={true} />
        </div>
      </div>
    </main>
  );
}
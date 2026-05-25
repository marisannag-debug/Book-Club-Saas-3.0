import Link from "next/link";
import ProposalList from "../../../../components/voting/ProposalList";
import type { BookProposal } from "../../../../components/voting/types";
import { getClubDashboardById } from "../../../../../lib/club-dashboard.server";

type ClubVotingCreatePageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDemoDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildDemoProposals(clubName: string): BookProposal[] {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(now.getDate() - 2);

  return [
    {
      id: "proposal-demo-1",
      title: "Wzgórze psów",
      author: "Nina Lykke",
      coverImageUrl: "https://images.unsplash.com/photo-1455885666463-5c3d1c8b0f4c?auto=format&fit=crop&w=900&q=80",
      coverImageName: "wzgorze-psow.jpg",
      description: `Książka do spokojnej dyskusji o relacjach i napięciu. Dobra propozycja dla klubu ${clubName}.`,
      createdBy: "demo-host",
      createdByLabel: "Ty",
      createdAt: formatDemoDate(twoDaysAgo),
      updatedAt: formatDemoDate(twoDaysAgo),
      canManage: true,
    },
    {
      id: "proposal-demo-2",
      title: "Normalni ludzie",
      author: "Sally Rooney",
      coverImageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
      coverImageName: "normalni-ludzie.jpg",
      description: "Krótka, intensywna historia, która dobrze działa jako lżejszy wybór po poprzednim miesiącu.",
      createdBy: "demo-member",
      createdByLabel: "Kasia",
      createdAt: formatDemoDate(yesterday),
      updatedAt: formatDemoDate(yesterday),
      canManage: true,
    },
    {
      id: "proposal-demo-3",
      title: "Opowieść podręcznej",
      author: "Margaret Atwood",
      coverImageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80",
      coverImageName: "opowiesc-podrecznej.jpg",
      description: "Mocniejszy temat na głosowanie, jeśli klub szuka bardziej dyskusyjnej lektury.",
      createdBy: "demo-member-2",
      createdByLabel: "Marek",
      createdAt: formatDemoDate(now),
      updatedAt: formatDemoDate(now),
      canManage: true,
    },
  ];
}

export default async function ClubVotingCreatePage({ params }: ClubVotingCreatePageProps) {
  const { id } = await params;
  const club = await getClubDashboardById(id);
  const initialProposals = buildDemoProposals(club.name);

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

        <ProposalList clubId={club.id} clubName={club.name} initialProposals={initialProposals} />
      </div>
    </main>
  );
}

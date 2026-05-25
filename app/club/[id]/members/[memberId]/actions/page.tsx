import Link from "next/link";
import MembershipActions from "../../../../../components/club/MembershipActions";

type MembershipActionsPageProps = {
  params: Promise<{
    id: string;
    memberId: string;
  }>;
};

export default async function MembershipActionsPage({ params }: MembershipActionsPageProps) {
  const { id, memberId } = await params;

  return (
    <main className="space-y-8">
      <header className="rounded-[2rem] border border-slate-200 bg-white/85 px-6 py-6 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href={`/club/${id}`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-4 py-2 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
          >
            <span aria-hidden="true">&larr;</span>
            Wróć do klubu
          </Link>
          <Link
            href={`/club/${id}/members/manage`}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
          >
            Zarządzaj rolami
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Członkostwo</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Brakujące funkcje członkostwa
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Zmień nazwę, zaakceptuj członkostwo albo opuść klub bez wychodzenia poza ten ekran.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Zakres</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Ekran pokazuje akcje dla bieżącego członkostwa. Parametr trasy: <span className="font-semibold text-slate-950">{memberId}</span>.
            </p>
          </div>
        </div>
      </header>

      <MembershipActions clubId={id} memberId={memberId} />
    </main>
  );
}

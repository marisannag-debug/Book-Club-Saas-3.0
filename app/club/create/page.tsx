import Link from "next/link";
import CreateClubForm from "../../components/club/CreateClubForm";

const createClubHighlights = [
  "Nazwa i opis bez zbędnych pól.",
  "Natychmiastowy podgląd sukcesu i redirect do nowego klubu.",
  "Zapis przez Supabase browser client z RLS i rollbackiem migracji.",
];

export default function CreateClubPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.12),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
        <section className="rounded-[2rem] border border-slate-200 bg-white/85 px-6 py-8 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8 sm:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Club flow</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Tworzenie klubu</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Załóż nowy klub, nadaj mu nazwę i przejdź od razu do własnego panelu. To jest pierwszy krok do zaproszeń,
            głosowań i spotkań.
          </p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {createClubHighlights.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              Wróć do dashboardu
            </Link>
            <Link
              href="/club/sunset-readers"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              Zobacz przykład klubu
            </Link>
          </div>
        </section>

        <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-white/85 px-6 py-8 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8 sm:py-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Nowy klub</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Minimalny formularz</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              W stage 8 potrzebujesz tylko nazwy i opcjonalnego opisu. Reszta pojawi się w kolejnych etapach.
            </p>
          </div>

          <CreateClubForm />
        </aside>
      </div>
    </main>
  );
}
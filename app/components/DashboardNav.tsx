import Link from "next/link";

export type ClubSummary = {
  id: string;
  name: string;
  description?: string;
};

type DashboardNavProps = {
  clubs?: ClubSummary[];
};

const primaryActions = [
  {
    href: "/club/create",
    label: "Utwórz nowy klub",
    description: "Rozpocznij nową przestrzeń do czytania i głosowań.",
  },
  {
    href: "/club/join",
    label: "Dołącz do klubu",
    description: "Wejdź do istniejącego klubu przez zaproszenie lub kod.",
  },
] as const;

export default function DashboardNav({ clubs = [] }: DashboardNavProps) {
  return (
    <section className="space-y-8 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="grid gap-4 md:grid-cols-2">
        {primaryActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950/20"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Start</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{action.label}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{action.description}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
              Otwórz
              <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Moje kluby</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Szybki dostęp do klubów</h2>
          </div>
          <Link href="/club/create" className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline">
            Dodaj klub
          </Link>
        </div>

        {clubs.length > 0 ? (
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {clubs.map((club) => (
              <li key={club.id}>
                <Link
                  href={`/club/${club.id}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950/20"
                >
                  <h3 className="text-lg font-semibold text-slate-950">{club.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {club.description || "Otwórz szczegóły klubu i przejdź do jego panelu."}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            Nie masz jeszcze klubów. Zacznij od utworzenia nowego klubu albo dołączenia do istniejącego.
          </div>
        )}
      </div>
    </section>
  );
}
import Link from "next/link";

export type ClubSummary = {
  id: string;
  name: string;
  description?: string;
};

type DashboardNavProps = {
  clubs?: ClubSummary[];
};

export default function DashboardNav({ clubs = [] }: DashboardNavProps) {
  return (
    <section className="space-y-8 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Moje kluby</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Szybki dostęp do klubów</h2>
          </div>
          <div className="flex flex-wrap gap-3 sm:justify-end">
            <Link
              href="/club/create"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              Utwórz nowy klub
            </Link>
            <Link
              href="/club/join"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              Dołącz do klubu
            </Link>
          </div>
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

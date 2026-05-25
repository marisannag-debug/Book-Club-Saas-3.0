import Link from "next/link";
import { Suspense } from "react";
import JoinClubForm from "../../components/club/JoinClubForm";

function JoinClubFormFallback() {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 px-6 py-8 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Zaproszenie</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Wczytujemy formularz</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">Przygotowujemy dane zaproszenia.</p>
    </section>
  );
}

export default function JoinClubPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.12),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <section className="rounded-[2rem] border border-slate-200 bg-white/85 px-6 py-8 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8 sm:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Club flow</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Dołączanie do klubu</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Użyj kodu z e-maila albo otwórz link z zaproszenia. Po potwierdzeniu od razu trafisz do panelu klubu.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Link z tokenem otwiera podgląd klubu i pozwala dołączyć jednym kliknięciem.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Kod zaproszenia działa jako ręczny fallback, gdy nie możesz użyć linku z maila.
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              Wróć do dashboardu
            </Link>
          </div>
        </section>

        <Suspense fallback={<JoinClubFormFallback />}>
          <JoinClubForm />
        </Suspense>
      </div>
    </main>
  );
}

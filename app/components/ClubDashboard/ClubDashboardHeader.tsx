import Link from "next/link";
import type { ClubDashboardModel } from "./types";

type ClubDashboardHeaderProps = {
  club: Pick<ClubDashboardModel, "id" | "name" | "description" | "memberCount">;
};

export default function ClubDashboardHeader({ club }: ClubDashboardHeaderProps) {
  return (
    <header className="rounded-[2rem] border border-slate-200 bg-white/85 px-6 py-6 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-4 py-2 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
        >
          <span aria-hidden="true">←</span>
          Wróć do dashboardu
        </Link>
        <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-4 py-2 font-medium text-slate-700">
          {club.memberCount} członków
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Club dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{club.name}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            {club.description}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Status klubu</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Widok startowy</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ten ekran gromadzi aktywne głosowanie, najbliższe spotkanie i szybki skrót do zaproszeń.
          </p>
        </div>
      </div>
    </header>
  );
}
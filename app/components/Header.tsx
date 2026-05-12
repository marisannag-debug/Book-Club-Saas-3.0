import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-slate-950">
          <span aria-hidden="true" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-lg shadow-slate-950/10">
            BC
          </span>
          <span>
            BookClub Pro
            <span aria-hidden="true" className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              MVP
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
            Zaloguj
          </Link>
          <Link href="/register" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-950/10 transition hover:bg-slate-800">
            Zarejestruj się
          </Link>
        </nav>
      </div>
    </header>
  );
}

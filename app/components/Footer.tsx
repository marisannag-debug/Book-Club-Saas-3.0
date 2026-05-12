import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">BookClub Pro</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <Link href="/login" className="transition hover:text-slate-950">
            Zaloguj
          </Link>
          <Link href="/register" className="transition hover:text-slate-950">
            Zarejestruj się
          </Link>
        </div>
      </div>
    </footer>
  );
}

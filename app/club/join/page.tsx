import Link from "next/link";

export default function JoinClubPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16 text-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Club flow</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Dołączanie do klubu</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
        Ten ekran będzie rozwinięty w stage 10. Na razie dashboard kieruje tutaj jako punkt startowy dołączania do istniejącego klubu.
      </p>
      <Link href="/dashboard" className="mt-8 inline-flex w-fit rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
        Wróć do dashboardu
      </Link>
    </main>
  );
}
import Link from "next/link";

type ClubPageProps = {
  params: {
    id: string;
  };
};

export default function ClubPage({ params }: ClubPageProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16 text-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Club panel</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Klub {params.id}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
        To jest tymczasowy ekran klubu, który zostanie rozbudowany w stage 7.
      </p>
      <Link href="/dashboard" className="mt-8 inline-flex w-fit rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
        Wróć do dashboardu
      </Link>
    </main>
  );
}
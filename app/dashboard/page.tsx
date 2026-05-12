"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardNav from "../components/DashboardNav";
import { getSupabaseBrowserClient } from "../../lib/supabase.client";

type DashboardSessionUser = {
  email?: string | null;
};

export default function DashboardPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "redirecting">("loading");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user as DashboardSessionUser | undefined;

        if (!mounted) {
          return;
        }

        if (!sessionUser) {
          setStatus("redirecting");
          window.location.replace("/login");
          return;
        }

        setUserEmail(sessionUser.email ?? null);
        setStatus("ready");
      } catch {
        if (!mounted) {
          return;
        }

        setStatus("redirecting");
        window.location.replace("/login");
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] px-6 py-10 text-slate-900">
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center rounded-[2rem] border border-slate-200 bg-white/80 px-8 py-16 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Ładowanie dashboardu</p>
        </div>
      </main>
    );
  }

  if (status === "redirecting") {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] px-6 py-10 text-slate-900">
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center rounded-[2rem] border border-slate-200 bg-white/80 px-8 py-16 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Przekierowywanie do logowania</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white/80 px-8 py-10 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Po zalogowaniu</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Twoje centrum BookClub Pro
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            {userEmail ? `Zalogowano jako ${userEmail}.` : "Zalogowano poprawnie."} Wybierz, czy chcesz
            utworzyć nowy klub, dołączyć do istniejącego czy otworzyć jeden z już dostępnych klubów.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/club/create"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Utwórz klub
            </Link>
            <Link
              href="/club/join"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Dołącz do klubu
            </Link>
          </div>
        </section>

        <DashboardNav
          clubs={[
            {
              id: "demo-reading-circle",
              name: "Demo Reading Circle",
              description: "Przykładowy klub do szybkiego przejścia do widoku panelu.",
            },
          ]}
        />
      </div>
    </main>
  );
}
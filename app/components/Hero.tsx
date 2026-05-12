import Link from "next/link";

const metrics = [
  {
    title: "Założenie klubu",
    value: (
      <strong className="block text-2xl font-semibold leading-none tracking-tight text-slate-950 sm:text-3xl">
        w <span className="font-semibold">5 minut</span>
      </strong>
    ),
  },
  {
    title: "Spotkania i głosowania",
    value: (
      <strong className="block text-2xl font-semibold leading-none tracking-tight text-slate-950 sm:text-3xl">
        w <span className="font-semibold">1 miejscu</span>
      </strong>
    ),
  },
  {
    title: "Wspólne czytanie",
    value: (
      <strong className="block text-2xl font-semibold leading-none tracking-tight text-slate-950 sm:text-3xl">
        bez <span className="font-semibold">chaosu</span>
      </strong>
    ),
  },
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_58%)]" />
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
        <div>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Organizuj swój book club w jednym miejscu
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Załóż klub, zaproś członków i przeprowadź głosowanie w kilka minut bez skakania między narzędziami. Możesz też dołączyć do istniejącego klubu!
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800">
              <strong className="font-semibold">Zarejestruj się</strong>
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950">
              Masz konto? Zaloguj się
            </Link>
          </div>
          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {metrics.map((metric, index) => (
              <div key={index} className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-950/5 backdrop-blur">
                <dt className="text-sm font-medium text-slate-500">{metric.title}</dt>
                <dd className="mt-1">{metric.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-[2rem] bg-blue-100/70 blur-2xl" />
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/10">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Book club preview</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">March reading session</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Active
              </span>
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">Next meeting</p>
                <p className="mt-1 text-base font-semibold text-slate-950">Thursday, 19:00</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-sm font-medium text-blue-700">Open voting</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">4 proposals</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-700">Invites sent</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">12 members</p>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-300 p-4">
                <p className="text-sm font-medium text-slate-500">Suggested next action</p>
                <p className="mt-1 text-base text-slate-700">Create a new voting round and share the link with the club.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

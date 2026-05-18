import type { ReactNode } from "react";

type ClubSummaryCardProps = {
  eyebrow: string;
  title: string;
  status: string;
  description: string;
  emptyState?: string;
  metrics?: Array<{
    label: string;
    value: string;
  }>;
  footer?: ReactNode;
};

export default function ClubSummaryCard({
  eyebrow,
  title,
  status,
  description,
  emptyState,
  metrics = [],
  footer,
}: ClubSummaryCardProps) {
  const hasDetails = metrics.length > 0;

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_16px_50px_-30px_rgba(15,23,42,0.3)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
        </div>
        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
          {status}
        </span>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>

      {hasDetails ? (
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{metric.label}</dt>
              <dd className="mt-1 text-lg font-semibold tracking-tight text-slate-950">{metric.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          {emptyState}
        </div>
      )}

      {footer ? <div className="mt-6">{footer}</div> : null}
    </section>
  );
}
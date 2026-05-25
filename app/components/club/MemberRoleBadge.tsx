import type { ClubRole } from "./roles";

type MemberRoleBadgeProps = {
  role: ClubRole;
};

const ROLE_LABELS: Record<ClubRole, string> = {
  host: "Prowadzący",
  member: "Członek",
};

const ROLE_STYLES: Record<ClubRole, string> = {
  host: "border-slate-950 bg-slate-950 text-white",
  member: "border-slate-200 bg-slate-100 text-slate-700",
};

export default function MemberRoleBadge({ role }: MemberRoleBadgeProps) {
  return (
    <span
      className={`inline-flex min-w-24 items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${ROLE_STYLES[role]}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}

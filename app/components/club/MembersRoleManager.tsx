"use client";

import { useMemo, useState } from "react";
import MemberRoleBadge from "./MemberRoleBadge";
import type { ClubRole, ClubRoleMember } from "./roles";
import { getSupabaseBrowserClient } from "../../../lib/supabase.browser";

type MembersRoleManagerProps = {
  clubId: string;
  currentUserRole: ClubRole;
  members: ClubRoleMember[];
  updateRole?: (clubId: string, userId: string, role: ClubRole) => Promise<void>;
};

function getNextRole(role: ClubRole): ClubRole {
  return role === "host" ? "member" : "host";
}

function getActionLabel(role: ClubRole) {
  return role === "host" ? "Zmień na członka" : "Nadaj prowadzenie";
}

function getRoleChangeMessage(member: ClubRoleMember, role: ClubRole) {
  const label = role === "host" ? "prowadzącego" : "członka";
  return `Rola ${member.displayName} została zmieniona na ${label}.`;
}

async function defaultUpdateRole(clubId: string, userId: string, role: ClubRole) {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error("Missing session");
  }

  const response = await fetch("/api/club-roles", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      clubId,
      userId,
      role,
    }),
  });

  if (!response.ok) {
    throw new Error("Role update failed");
  }
}

export default function MembersRoleManager({
  clubId,
  currentUserRole,
  members,
  updateRole = defaultUpdateRole,
}: MembersRoleManagerProps) {
  const [visibleMembers, setVisibleMembers] = useState(members);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Lista członków jest gotowa.");

  const canManageRoles = currentUserRole === "host";
  const hostCount = useMemo(() => visibleMembers.filter((member) => member.role === "host").length, [visibleMembers]);

  async function handleRoleChange(member: ClubRoleMember) {
    const nextRole = getNextRole(member.role);

    if (member.isCreator) {
      setStatusMessage("Twórca klubu zawsze pozostaje prowadzącym.");
      return;
    }

    if (member.role === "host" && hostCount <= 1) {
      setStatusMessage("Klub musi mieć przynajmniej jednego prowadzącego.");
      return;
    }

    setPendingUserId(member.userId);
    setStatusMessage("Aktualizujemy rolę członka...");

    try {
      await updateRole(clubId, member.userId, nextRole);
      setVisibleMembers((currentMembers) =>
        currentMembers.map((currentMember) =>
          currentMember.userId === member.userId ? { ...currentMember, role: nextRole } : currentMember,
        ),
      );
      setStatusMessage(getRoleChangeMessage(member, nextRole));
    } catch {
      setStatusMessage("Nie udało się zmienić roli. Spróbuj ponownie.");
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Członkowie</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Lista członków</h2>
          </div>
          <MemberRoleBadge role={currentUserRole} />
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {visibleMembers.map((member) => {
          const isPending = pendingUserId === member.userId;
          const cannotDemoteLastHost = member.role === "host" && hostCount <= 1;
          const roleActionDisabled = isPending || member.isCreator || cannotDemoteLastHost;

          return (
            <article
              key={member.userId}
              className="grid gap-4 px-6 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-8"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-950">{member.displayName}</h3>
                  {member.isCurrentUser ? (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                      Ty
                    </span>
                  ) : null}
                  {member.isCreator ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      Twórca
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  Dołączył: {member.joinedAt}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <MemberRoleBadge role={member.role} />
                {canManageRoles ? (
                  <button
                    type="button"
                    disabled={roleActionDisabled}
                    onClick={() => handleRoleChange(member)}
                    aria-label={`${getActionLabel(member.role)} dla ${member.displayName}`}
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
                  >
                    {isPending ? "Zmieniamy..." : getActionLabel(member.role)}
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {!canManageRoles ? (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm leading-6 text-slate-600 sm:px-8">
          Masz dostęp tylko do podglądu listy członków i ról.
        </div>
      ) : null}

      <div aria-live="polite" className="border-t border-slate-200 px-6 py-4 text-sm font-medium text-slate-700 sm:px-8">
        {statusMessage}
      </div>
    </section>
  );
}

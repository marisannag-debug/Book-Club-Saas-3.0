import Link from "next/link";
import ClubDashboardHeader from "./ClubDashboardHeader";
import ClubSummaryCard from "./ClubSummaryCard";
import type { ClubDashboardModel } from "./types";
import { buildClubDashboardFallback as buildClubDashboardMock } from "../../../lib/club-dashboard.server";

type ClubDashboardProps = {
  club: ClubDashboardModel;
};

function buildStageBadge(stageLabel: string) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
      {stageLabel}
    </span>
  );
}

export { buildClubDashboardMock };

export default function ClubDashboard({ club }: ClubDashboardProps) {
  return (
    <main className="space-y-8">
      <ClubDashboardHeader club={club} />

      <section aria-label="Podsumowanie klubu" className="grid gap-6 xl:grid-cols-3">
        <ClubSummaryCard
          eyebrow="Aktywne voting"
          title={club.activeVoting ? club.activeVoting.title : "Brak aktywnego głosowania"}
          status={club.activeVoting ? club.activeVoting.status : "Stage 12"}
          description={
            club.activeVoting
              ? club.activeVoting.summary
              : "W tym miejscu pojawi się głosowanie na książkę, gdy organizator je rozpocznie."
          }
          emptyState="Nie ma jeszcze aktywnego głosowania. Ten blok przygotowuje miejsce na stage 12, kiedy dodamy pełny flow wyboru książki."
          metrics={
            club.activeVoting
              ? [
                  { label: "Termin", value: club.activeVoting.deadline },
                  { label: "Propozycje", value: `${club.activeVoting.proposalsCount}` },
                ]
              : []
          }
          footer={
            <div className="flex flex-wrap items-center gap-3">
              {club.activeVoting ? buildStageBadge("Stage 12") : buildStageBadge("W przygotowaniu")}
              <Link
                href={`/club/${club.id}/voting/create`}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
              >
                Propozycje książek
              </Link>
            </div>
          }
        />

        <ClubSummaryCard
          eyebrow="Next meeting"
          title={club.nextMeeting ? club.nextMeeting.title : "Brak zaplanowanego spotkania"}
          status={club.nextMeeting ? "Ustalony termin" : "Stage 14"}
          description={
            club.nextMeeting
              ? club.nextMeeting.summary
              : "Pusty stan przypomina, że harmonogram spotkań dojdzie w kolejnym kroku rozwoju produktu."
          }
          emptyState="Nie ma jeszcze zaplanowanego spotkania. W kolejnym etapie dołożymy pełny widok terminu, miejsca i agendy."
          metrics={
            club.nextMeeting
              ? [
                  { label: "Data", value: club.nextMeeting.date },
                  { label: "Godzina", value: club.nextMeeting.time },
                  { label: "Miejsce", value: club.nextMeeting.venue },
                ]
              : []
          }
          footer={club.nextMeeting ? buildStageBadge("Stage 14") : buildStageBadge("W przygotowaniu")}
        />

        <ClubSummaryCard
          eyebrow="Invite members"
          title="Członkowie i zaproszenia"
          status={club.invite.status}
          description={club.invite.hint}
          metrics={[{ label: "Członkowie", value: `${club.memberCount}` }]}
          footer={
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/club/${club.id}/members/manage`}
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
              >
                Lista członków
              </Link>
              <Link
                href={`/club/${club.id}/invite`}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
              >
                Generuj zaproszenie
              </Link>
              <Link
                href={`/club/${club.id}/members/me/actions`}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
              >
                Moje członkostwo
              </Link>
            </div>
          }
        />
      </section>
    </main>
  );
}

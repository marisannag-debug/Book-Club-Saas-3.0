import Link from "next/link";
import ClubDashboardHeader from "./ClubDashboardHeader";
import ClubSummaryCard from "./ClubSummaryCard";
import type { ClubDashboardModel } from "./types";
import { buildClubDashboardFallback } from "../../../lib/club-dashboard.server";

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

export { buildClubDashboardFallback as buildClubDashboardMock } from "../../../lib/club-dashboard.server";

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
          footer={club.activeVoting ? buildStageBadge("Stage 12") : buildStageBadge("W przygotowaniu")}
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
          title="Skrót do zaproszeń"
          status={club.invite.status}
          description={club.invite.hint}
          metrics={[
            { label: "Kod klubu", value: club.invite.code },
            { label: "Członkowie", value: `${club.memberCount}` },
          ]}
          footer={
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
              >
                Przejdź do listy klubów
              </Link>
              {buildStageBadge("Stage 10")}
            </div>
          }
        />
      </section>
    </main>
  );
}
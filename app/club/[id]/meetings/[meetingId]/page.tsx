import Link from "next/link";
import MeetingPlannerWorkspace from "../../../../components/meetings/MeetingPlannerWorkspace";
import { getClubDashboardById } from "../../../../../lib/club-dashboard.server";

type ClubMeetingDetailPageProps = {
  params: Promise<{
    id: string;
    meetingId: string;
  }>;
};

export default async function ClubMeetingDetailPage({ params }: ClubMeetingDetailPageProps) {
  const { id } = await params;
  const club = await getClubDashboardById(id);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.12),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white/85 px-6 py-8 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8 sm:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Stage 14 · planer terminu</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Planer terminu spotkania</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Dodawaj propozycje terminów pojedynczo i głosuj nad nimi bez wychodzenia z tej podstrony.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/club/${club.id}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              Wróć do klubu
            </Link>
          </div>
        </section>

        <MeetingPlannerWorkspace clubId={club.id} clubName={club.name} initialMeeting={null} />
      </div>
    </main>
  );
}

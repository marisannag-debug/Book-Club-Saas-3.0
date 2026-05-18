import ClubDashboard from "../../components/ClubDashboard/ClubDashboard";
import { getClubDashboardById } from "../../../lib/club-dashboard.server";

type ClubPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClubPage({ params }: ClubPageProps) {
  const { id } = await params;
  const club = await getClubDashboardById(id);

  return <ClubDashboard club={club} />;
}
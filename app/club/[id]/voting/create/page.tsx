import { redirect } from "next/navigation";

type ClubVotingCreatePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClubVotingCreatePage({ params }: ClubVotingCreatePageProps) {
  const { id } = await params;
  redirect(`/club/${id}/voting`);
}

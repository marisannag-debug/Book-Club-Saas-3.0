export type ClubDashboardVoting = {
  title: string;
  status: string;
  deadline: string;
  proposalsCount: number;
  summary: string;
};

export type ClubDashboardMeeting = {
  title: string;
  date: string;
  time: string;
  venue: string;
  summary: string;
};

export type ClubDashboardInvite = {
  code: string;
  hint: string;
  status: string;
};

export type ClubDashboardModel = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  activeVoting: ClubDashboardVoting | null;
  nextMeeting: ClubDashboardMeeting | null;
  invite: ClubDashboardInvite;
};
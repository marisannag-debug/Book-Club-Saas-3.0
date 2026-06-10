export type MeetingPollRole = "host" | "member";

export type MeetingPollStatus = "draft" | "open" | "closed" | "finalized";

export type MeetingSlotDraft = {
  id: string;
  label: string;
  date: string;
  time: string;
  endTime: string;
};

export type MeetingPollSlot = {
  id: string;
  label: string;
  startLabel: string;
  endLabel: string;
  votesCount: number;
  currentUserHasVoted: boolean;
  // demo metadata
  createdByIsCurrentUser?: boolean;
  createdByLabel?: string;
};

export type MeetingPoll = {
  id: string;
  clubId: string;
  clubName: string;
  title: string;
  description: string;
  status: MeetingPollStatus;
  createdAtLabel: string;
  updatedAtLabel: string;
  createdByLabel: string;
  finalizedSlotId: string | null;
  currentUserRole: MeetingPollRole;
  currentUserVoteSlotId: string | null;
  slots: MeetingPollSlot[];
};

export type MeetingPollDraft = {
  title: string;
  description: string;
};

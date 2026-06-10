export const PROPOSAL_DESCRIPTION_MAX_LENGTH = 280;

export type ProposalDraft = {
  title: string;
  author: string;
  coverImageFile: File | null;
  coverImageName: string;
  coverImagePreviewUrl: string;
  description: string;
};

export type ProposalFieldErrors = Partial<Record<keyof ProposalDraft, string>>;

export type BookProposal = {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string;
  coverImageName: string;
  description: string;
  createdBy: string;
  createdByLabel: string;
  createdAt: string;
  updatedAt: string;
  canManage: boolean;
  canEdit: boolean;
  canDelete: boolean;
  votesCount?: number;
  currentUserHasVoted?: boolean;
};

export type MeetingSlotDraft = {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  venue: string;
  description: string;
};

export type MeetingSlotFieldErrors = Partial<Record<keyof MeetingSlotDraft, string>>;

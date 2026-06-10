import { z } from "zod";

export const voteProposalSchema = z.object({
  proposalId: z.string().trim().min(1, "Brakuje identyfikatora propozycji."),
});

export type VoteProposalInput = z.infer<typeof voteProposalSchema>;

export type ProposalVoteSummary = {
  votesCount: number;
  currentUserHasVoted: boolean;
};
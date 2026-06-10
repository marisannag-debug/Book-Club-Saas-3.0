import { createClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createProposalVote, deleteProposalVote, getProposalVoteSummaries } from "../../lib/db/votes";
import { resetSupabaseServerClientForTests, getSupabaseServerClient } from "../../lib/supabase.server";

const mockGetUser = vi.fn();
const mockClubMaybeSingle = vi.fn();
const mockMembersOrder = vi.fn();
const mockProposalMaybeSingle = vi.fn();
const mockVotesSelect = vi.fn();
const mockVotesIn = vi.fn();
const mockVotesInsert = vi.fn();
const mockVotesDelete = vi.fn();
const mockVotesDeleteFirstEq = vi.fn();
const mockVotesDeleteSecondEq = vi.fn();
const mockVotesDeleteSelect = vi.fn();
const mockVotesDeleteMaybeSingle = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

vi.mock("../../lib/supabase.server", () => ({
  getSupabaseServerClient: vi.fn(),
  resetSupabaseServerClientForTests: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);
const mockedGetSupabaseServerClient = vi.mocked(getSupabaseServerClient);

function buildRequestClient() {
  return {
    auth: {
      getUser: mockGetUser,
    },
  };
}

function buildServerClient() {
  return {
    from: (table: string) => {
      if (table === "clubs") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: mockClubMaybeSingle,
            }),
          }),
        };
      }

      if (table === "club_members") {
        return {
          select: () => ({
            eq: () => ({
              order: mockMembersOrder,
            }),
          }),
        };
      }

      if (table === "book_proposals") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: mockProposalMaybeSingle,
            }),
          }),
        };
      }

      if (table === "votes") {
        return {
          select: () => ({
            in: mockVotesIn,
          }),
          insert: mockVotesInsert.mockReturnValue({
            error: null,
          }),
          delete: mockVotesDelete.mockReturnValue({
            eq: mockVotesDeleteFirstEq.mockReturnValue({
              eq: mockVotesDeleteSecondEq.mockReturnValue({
                select: mockVotesDeleteSelect.mockReturnValue({
                  maybeSingle: mockVotesDeleteMaybeSingle,
                }),
              }),
            }),
          }),
        };
      }

      return {};
    },
  };
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  resetSupabaseServerClientForTests();

  mockedCreateClient.mockReset();
  mockedCreateClient.mockImplementation(() => buildRequestClient() as never);
  mockedGetSupabaseServerClient.mockReturnValue(buildServerClient() as never);

  mockGetUser.mockReset();
  mockClubMaybeSingle.mockReset();
  mockMembersOrder.mockReset();
  mockProposalMaybeSingle.mockReset();
  mockVotesSelect.mockReset();
  mockVotesIn.mockReset();
  mockVotesInsert.mockClear();
  mockVotesDelete.mockClear();
  mockVotesDeleteFirstEq.mockClear();
  mockVotesDeleteSecondEq.mockClear();
  mockVotesDeleteSelect.mockClear();
  mockVotesDeleteMaybeSingle.mockReset();
});

describe("vote backend helpers", () => {
  it("aggregates vote counts and current-user vote state", async () => {
    mockVotesIn.mockResolvedValue({
      data: [
        { proposal_id: "proposal-1", user_id: "member-id" },
        { proposal_id: "proposal-1", user_id: "other-id" },
        { proposal_id: "proposal-2", user_id: "other-id" },
      ],
      error: null,
    });

    const summaries = await getProposalVoteSummaries(["proposal-1", "proposal-2"], "member-id");

    expect(summaries.get("proposal-1")).toEqual({
      votesCount: 2,
      currentUserHasVoted: true,
    });
    expect(summaries.get("proposal-2")).toEqual({
      votesCount: 1,
      currentUserHasVoted: false,
    });
  });

  it("creates a vote for an active club member", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "member-id", email: "reader@example.com" } },
      error: null,
    });
    mockClubMaybeSingle.mockResolvedValue({
      data: {
        id: "club-id-1",
        name: "Sunset Readers",
        created_by: "creator-id",
      },
      error: null,
    });
    mockMembersOrder.mockResolvedValue({
      data: [
        {
          user_id: "member-id",
          role: "member",
          membership_status: "active",
        },
      ],
      error: null,
    });
    mockProposalMaybeSingle.mockResolvedValue({
      data: {
        id: "proposal-1",
        club_id: "club-id-1",
      },
      error: null,
    });

    const result = await createProposalVote("proposal-1", "Bearer access-token");

    expect(result).toEqual({
      ok: true,
      status: 201,
      message: "Głos został zapisany.",
      proposalId: "proposal-1",
    });
    expect(mockVotesInsert).toHaveBeenCalledWith({
      proposal_id: "proposal-1",
      user_id: "member-id",
    });
  });

  it("deletes a vote for an active club member", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "member-id", email: "reader@example.com" } },
      error: null,
    });
    mockClubMaybeSingle.mockResolvedValue({
      data: {
        id: "club-id-1",
        name: "Sunset Readers",
        created_by: "creator-id",
      },
      error: null,
    });
    mockMembersOrder.mockResolvedValue({
      data: [
        {
          user_id: "member-id",
          role: "member",
          membership_status: "active",
        },
      ],
      error: null,
    });
    mockProposalMaybeSingle.mockResolvedValue({
      data: {
        id: "proposal-1",
        club_id: "club-id-1",
      },
      error: null,
    });
    mockVotesDeleteMaybeSingle.mockResolvedValue({
      data: { proposal_id: "proposal-1" },
      error: null,
    });

    const result = await deleteProposalVote("proposal-1", "Bearer access-token");

    expect(result).toEqual({
      ok: true,
      status: 200,
      message: "Głos został usunięty.",
      proposalId: "proposal-1",
    });
  });
});
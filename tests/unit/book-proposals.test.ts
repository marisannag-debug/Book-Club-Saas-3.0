import { createClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bookProposalCreateSchema,
  bookProposalUpdateSchema,
} from "../../lib/book-proposals";
import {
  createBookProposal,
  deleteBookProposal,
  listBookProposals,
  updateBookProposal,
} from "../../lib/db/book-proposals";
import { getSupabaseServerClient, resetSupabaseServerClientForTests } from "../../lib/supabase.server";

const mockGetUser = vi.fn();
const mockClubMaybeSingle = vi.fn();
const mockMembersOrder = vi.fn();
const mockProposalMaybeSingle = vi.fn();
const mockProposalOrder = vi.fn();
const mockProposalInsert = vi.fn();
const mockProposalInsertSelect = vi.fn();
const mockProposalInsertSingle = vi.fn();
const mockProposalUpdate = vi.fn();
const mockProposalUpdateEq = vi.fn();
const mockProposalUpdateSelect = vi.fn();
const mockProposalUpdateSingle = vi.fn();
const mockProposalDelete = vi.fn();
const mockProposalDeleteEq = vi.fn();
const mockVotesSelect = vi.fn();
const mockVotesIn = vi.fn();

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
              order: mockProposalOrder,
              maybeSingle: mockProposalMaybeSingle,
            }),
          }),
          insert: mockProposalInsert.mockReturnValue({
            select: mockProposalInsertSelect.mockReturnValue({
              single: mockProposalInsertSingle,
            }),
          }),
          update: mockProposalUpdate.mockReturnValue({
            eq: mockProposalUpdateEq.mockReturnValue({
              select: mockProposalUpdateSelect.mockReturnValue({
                single: mockProposalUpdateSingle,
              }),
            }),
          }),
          delete: mockProposalDelete.mockReturnValue({
            eq: mockProposalDeleteEq,
          }),
        };
      }

      if (table === "votes") {
        return {
          select: () => ({
            in: mockVotesIn,
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
  mockedCreateClient.mockImplementation((_url: string, key: string) => {
    return key === "anon-key" ? (buildRequestClient() as never) : (buildRequestClient() as never);
  });
  mockedGetSupabaseServerClient.mockReturnValue(buildServerClient() as never);

  mockGetUser.mockReset();
  mockClubMaybeSingle.mockReset();
  mockMembersOrder.mockReset();
  mockProposalMaybeSingle.mockReset();
  mockProposalOrder.mockReset();
  mockProposalInsert.mockClear();
  mockProposalInsertSelect.mockClear();
  mockProposalInsertSingle.mockReset();
  mockProposalUpdate.mockClear();
  mockProposalUpdateEq.mockClear();
  mockProposalUpdateSelect.mockClear();
  mockProposalUpdateSingle.mockReset();
  mockProposalDelete.mockClear();
  mockProposalDeleteEq.mockReset();
  mockVotesSelect.mockClear();
  mockVotesIn.mockReset();
});

describe("book proposal helper validation", () => {
  it("accepts the proposal create payload", () => {
    const parsed = bookProposalCreateSchema.safeParse({
      clubId: "club-1",
      title: "Normalni ludzie",
      author: "Sally Rooney",
      description: "Historia relacji i rozmów.",
      coverImageUrl: "data:image/jpeg;base64,cover",
      coverImageName: "cover.jpg",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects empty update payloads", () => {
    const parsed = bookProposalUpdateSchema.safeParse({
      proposalId: "proposal-1",
    });

    expect(parsed.success).toBe(false);
  });
});

describe("book proposal backend helpers", () => {
  it("lists proposals for an active club member", async () => {
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
    mockProposalOrder.mockResolvedValue({
      data: [
        {
          id: "proposal-1",
          club_id: "club-id-1",
          title: "Normalni ludzie",
          author: "Sally Rooney",
          description: null,
          cover_image_url: null,
          cover_image_name: null,
          created_by: "member-id",
          created_at: "2026-05-25T10:00:00.000Z",
          updated_at: "2026-05-25T10:00:00.000Z",
        },
      ],
      error: null,
    });
    mockVotesIn.mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await listBookProposals("club-id-1", "Bearer access-token");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: "proposal-1",
        clubId: "club-id-1",
        title: "Normalni ludzie",
        votesCount: 0,
        currentUserHasVoted: false,
      });
    }
  });

  it("creates a proposal and normalizes optional fields", async () => {
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
    mockProposalInsertSingle.mockResolvedValue({
      data: {
        id: "proposal-2",
        club_id: "club-id-1",
        title: "Zabić drozda",
        author: "Harper Lee",
        description: null,
        cover_image_url: null,
        cover_image_name: null,
        created_by: "member-id",
        created_at: "2026-05-25T10:00:00.000Z",
        updated_at: "2026-05-25T10:00:00.000Z",
      },
      error: null,
    });

    const result = await createBookProposal(
      {
        clubId: "club-id-1",
        title: "Zabić drozda",
        author: "Harper Lee",
        description: "   ",
        coverImageUrl: "   ",
        coverImageName: "   ",
      },
      "Bearer access-token",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.proposal).toMatchObject({
        id: "proposal-2",
        title: "Zabić drozda",
        author: "Harper Lee",
        description: "",
      });
    }

    expect(mockProposalInsert).toHaveBeenCalledWith({
      club_id: "club-id-1",
      title: "Zabić drozda",
      author: "Harper Lee",
      description: null,
      cover_image_url: null,
      cover_image_name: null,
      created_by: "member-id",
    });
  });

  it("lets the host update another member's proposal", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "creator-id", email: "host@example.com" } },
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
      data: [],
      error: null,
    });
    mockProposalMaybeSingle.mockResolvedValue({
      data: {
        id: "proposal-3",
        club_id: "club-id-1",
        title: "Wzgórze psów",
        author: "Nina Lykke",
        description: "Opis",
        cover_image_url: null,
        cover_image_name: null,
        created_by: "member-id",
        created_at: "2026-05-25T10:00:00.000Z",
        updated_at: "2026-05-25T10:00:00.000Z",
      },
      error: null,
    });
    mockProposalUpdateSingle.mockResolvedValue({
      data: {
        id: "proposal-3",
        club_id: "club-id-1",
        title: "Wzgórze psów - nowe wydanie",
        author: "Nina Lykke",
        description: "Zaktualizowany opis",
        cover_image_url: null,
        cover_image_name: null,
        created_by: "member-id",
        created_at: "2026-05-25T10:00:00.000Z",
        updated_at: "2026-05-25T11:00:00.000Z",
      },
      error: null,
    });

    const result = await updateBookProposal(
      {
        proposalId: "proposal-3",
        title: "Wzgórze psów - nowe wydanie",
        description: "Zaktualizowany opis",
      },
      "Bearer access-token",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.proposal.title).toBe("Wzgórze psów - nowe wydanie");
    }

    expect(mockProposalUpdate).toHaveBeenCalledWith({
      title: "Wzgórze psów - nowe wydanie",
      description: "Zaktualizowany opis",
    });
  });

  it("rejects deletion when the user is outside the club", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "outsider-id", email: "outsider@example.com" } },
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
      data: [],
      error: null,
    });
    mockProposalMaybeSingle.mockResolvedValue({
      data: {
        id: "proposal-4",
        club_id: "club-id-1",
        title: "Normalni ludzie",
        author: "Sally Rooney",
        description: null,
        cover_image_url: null,
        cover_image_name: null,
        created_by: "member-id",
        created_at: "2026-05-25T10:00:00.000Z",
        updated_at: "2026-05-25T10:00:00.000Z",
      },
      error: null,
    });

    const result = await deleteBookProposal("proposal-4", "Bearer access-token");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
    expect(mockProposalDelete).not.toHaveBeenCalled();
  });
});

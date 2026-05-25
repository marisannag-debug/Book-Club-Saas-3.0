import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { renameMembership } from "../../lib/db/membership";
import { resetSupabaseServerClientForTests } from "../../lib/supabase.server";

const mockGetUser = vi.fn();
const mockClubMaybeSingle = vi.fn();
const mockMemberMaybeSingle = vi.fn();
const mockMemberUpsert = vi.fn();
const mockMemberEqClub = vi.fn();
const mockMemberEqUser = vi.fn();
const mockMemberSelectAfterUpsert = vi.fn();
const mockMemberSingleAfterUpsert = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);

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
            eq: mockMemberEqClub.mockReturnValue({
              eq: mockMemberEqUser.mockReturnValue({
                maybeSingle: mockMemberMaybeSingle,
              }),
            }),
          }),
          upsert: mockMemberUpsert.mockReturnValue({
            select: mockMemberSelectAfterUpsert.mockReturnValue({
              single: mockMemberSingleAfterUpsert,
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
  mockedCreateClient.mockImplementation((_url: string, key: string) => {
    return key === "anon-key" ? (buildRequestClient() as never) : (buildServerClient() as never);
  });

  mockGetUser.mockReset();
  mockClubMaybeSingle.mockReset();
  mockMemberMaybeSingle.mockReset();
  mockMemberUpsert.mockReset();
  mockMemberEqClub.mockReset();
  mockMemberEqUser.mockReset();
  mockMemberSelectAfterUpsert.mockClear();
  mockMemberSingleAfterUpsert.mockReset();
});

describe("renameMembership", () => {
  it("creates the creator membership with an upsert when the row is missing", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "creator-id", email: "creator@example.com" } },
      error: null,
    });

    mockClubMaybeSingle.mockResolvedValue({
      data: {
        id: "club-id-1",
        name: "Sunset Readers",
        created_by: "creator-id",
        created_at: "2026-05-21T10:00:00.000Z",
      },
      error: null,
    });

    mockMemberMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    mockMemberSingleAfterUpsert.mockResolvedValue({
      data: {
        id: "member-id-1",
        club_id: "club-id-1",
        user_id: "creator-id",
        role: "host",
        display_name: "Marta Nowak",
        membership_status: "active",
        joined_at: "2026-05-21T10:00:00.000Z",
        updated_at: "2026-05-21T10:10:00.000Z",
      },
      error: null,
    });

    const result = await renameMembership("club-id-1", "Marta Nowak", "Bearer access-token");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.membership.displayName).toBe("Marta Nowak");
    }

    expect(mockMemberUpsert).toHaveBeenCalledWith(
      {
        club_id: "club-id-1",
        user_id: "creator-id",
        role: "host",
        membership_status: "active",
        display_name: "Marta Nowak",
      },
      {
        onConflict: "club_id,user_id",
      },
    );
  });
});
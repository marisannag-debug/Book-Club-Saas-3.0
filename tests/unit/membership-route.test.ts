import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  mockGetMembershipDetails: vi.fn(),
  mockAcceptMembership: vi.fn(),
  mockLeaveClub: vi.fn(),
  mockRenameMembership: vi.fn(),
}));

vi.mock("../../lib/db/membership", () => ({
  acceptMembership: mocks.mockAcceptMembership,
  getMembershipDetails: mocks.mockGetMembershipDetails,
  leaveClub: mocks.mockLeaveClub,
  renameMembership: mocks.mockRenameMembership,
}));

import { GET, PATCH } from "../../app/api/membership/route";

beforeEach(() => {
  mocks.mockGetMembershipDetails.mockReset();
  mocks.mockAcceptMembership.mockReset();
  mocks.mockLeaveClub.mockReset();
  mocks.mockRenameMembership.mockReset();
});

describe("membership API route", () => {
  it("returns membership details for GET", async () => {
    mocks.mockGetMembershipDetails.mockResolvedValue({
      ok: true,
      status: 200,
      clubId: "club-1",
      clubName: "Sunset Readers",
      currentUserRole: "member",
      membership: {
        memberId: "membership-1",
        displayName: "Marta Nowak",
        status: "active",
        joinedAt: "2026-05-21",
        isCreator: false,
        canAccept: false,
        canLeave: true,
        canRename: true,
      },
    });

    const response = await GET(new Request("http://localhost/api/membership?clubId=club-1", {
      headers: {
        authorization: "Bearer access-token",
      },
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      status: 200,
      clubId: "club-1",
      clubName: "Sunset Readers",
      currentUserRole: "member",
      membership: {
        memberId: "membership-1",
        displayName: "Marta Nowak",
        status: "active",
        joinedAt: "2026-05-21",
        isCreator: false,
        canAccept: false,
        canLeave: true,
        canRename: true,
      },
    });

    expect(mocks.mockGetMembershipDetails).toHaveBeenCalledWith("club-1", "Bearer access-token");
  });

  it("dispatches rename actions through the helper", async () => {
    mocks.mockRenameMembership.mockResolvedValue({
      ok: true,
      status: 200,
      clubId: "club-1",
      clubName: "Sunset Readers",
      currentUserRole: "member",
      message: "Nazwa członka została zaktualizowana.",
      membership: {
        memberId: "membership-1",
        displayName: "Marta Nowak",
        status: "active",
        joinedAt: "2026-05-21",
        isCreator: false,
        canAccept: false,
        canLeave: true,
        canRename: true,
      },
    });

    const response = await PATCH(new Request("http://localhost/api/membership", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer access-token",
      },
      body: JSON.stringify({
        action: "rename",
        clubId: "club-1",
        displayName: "Marta Nowak",
      }),
    }));

    expect(response.status).toBe(200);
    expect(mocks.mockRenameMembership).toHaveBeenCalledWith("club-1", "Marta Nowak", "Bearer access-token");
  });

  it("returns validation errors for invalid payloads", async () => {
    const response = await PATCH(new Request("http://localhost/api/membership", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer access-token",
      },
      body: JSON.stringify({
        action: "rename",
        clubId: "club-1",
        displayName: "A",
      }),
    }));

    expect(response.status).toBe(400);
    expect(mocks.mockRenameMembership).not.toHaveBeenCalled();
  });
});

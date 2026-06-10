import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mockCreateProposalVote: vi.fn(),
  mockDeleteProposalVote: vi.fn(),
}));

vi.mock("../../lib/db/votes", () => ({
  createProposalVote: mocks.mockCreateProposalVote,
  deleteProposalVote: mocks.mockDeleteProposalVote,
}));

import { DELETE, POST } from "../../app/api/votes/route";

beforeEach(() => {
  mocks.mockCreateProposalVote.mockReset();
  mocks.mockDeleteProposalVote.mockReset();
});

describe("votes API route", () => {
  it("dispatches POST requests through the helper", async () => {
    mocks.mockCreateProposalVote.mockResolvedValue({
      ok: true,
      status: 201,
      message: "Głos został zapisany.",
      proposalId: "proposal-1",
    });

    const response = await POST(
      new Request("http://localhost/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer access-token",
        },
        body: JSON.stringify({ proposalId: "proposal-1" }),
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.mockCreateProposalVote).toHaveBeenCalledWith("proposal-1", "Bearer access-token");
  });

  it("dispatches DELETE requests through the helper", async () => {
    mocks.mockDeleteProposalVote.mockResolvedValue({
      ok: true,
      status: 200,
      message: "Głos został usunięty.",
      proposalId: "proposal-1",
    });

    const response = await DELETE(
      new Request("http://localhost/api/votes?proposalId=proposal-1", {
        method: "DELETE",
        headers: {
          authorization: "Bearer access-token",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.mockDeleteProposalVote).toHaveBeenCalledWith("proposal-1", "Bearer access-token");
  });
});
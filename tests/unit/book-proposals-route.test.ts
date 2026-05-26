import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mockListBookProposals: vi.fn(),
  mockCreateBookProposal: vi.fn(),
  mockUpdateBookProposal: vi.fn(),
  mockDeleteBookProposal: vi.fn(),
}));

vi.mock("../../lib/db/book-proposals", () => ({
  createBookProposal: mocks.mockCreateBookProposal,
  deleteBookProposal: mocks.mockDeleteBookProposal,
  listBookProposals: mocks.mockListBookProposals,
  updateBookProposal: mocks.mockUpdateBookProposal,
}));

import { DELETE, PATCH } from "../../app/api/book-proposals/[proposalId]/route";
import { GET, POST } from "../../app/api/book-proposals/route";

beforeEach(() => {
  mocks.mockListBookProposals.mockReset();
  mocks.mockCreateBookProposal.mockReset();
  mocks.mockUpdateBookProposal.mockReset();
  mocks.mockDeleteBookProposal.mockReset();
});

describe("book proposals API route", () => {
  it("returns the proposal list for GET", async () => {
    mocks.mockListBookProposals.mockResolvedValue({
      ok: true,
      status: 200,
      clubId: "club-1",
      items: [],
    });

    const response = await GET(
      new Request("http://localhost/api/book-proposals?clubId=club-1", {
        headers: {
          authorization: "Bearer access-token",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      status: 200,
      clubId: "club-1",
      items: [],
    });
    expect(mocks.mockListBookProposals).toHaveBeenCalledWith("club-1", "Bearer access-token");
  });

  it("dispatches create requests through the helper", async () => {
    mocks.mockCreateBookProposal.mockResolvedValue({
      ok: true,
      status: 201,
      message: "Propozycja książki została dodana.",
      proposal: {
        id: "proposal-1",
        clubId: "club-1",
        title: "Normalni ludzie",
        author: "Sally Rooney",
        description: "",
        coverImageUrl: "",
        coverImageName: "",
        createdBy: "member-id",
        createdAt: "2026-05-25T10:00:00.000Z",
        updatedAt: "2026-05-25T10:00:00.000Z",
      },
    });

    const response = await POST(
      new Request("http://localhost/api/book-proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer access-token",
        },
        body: JSON.stringify({
          clubId: "club-1",
          title: "Normalni ludzie",
          author: "Sally Rooney",
          description: "",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.mockCreateBookProposal).toHaveBeenCalledWith(
      {
        clubId: "club-1",
        title: "Normalni ludzie",
        author: "Sally Rooney",
        description: "",
        coverImageUrl: "",
        coverImageName: "",
      },
      "Bearer access-token",
    );
  });

  it("dispatches patch requests through the helper", async () => {
    mocks.mockUpdateBookProposal.mockResolvedValue({
      ok: true,
      status: 200,
      message: "Propozycja książki została zaktualizowana.",
      proposal: {
        id: "proposal-1",
        clubId: "club-1",
        title: "Normalni ludzie - nowe wydanie",
        author: "Sally Rooney",
        description: "Aktualizacja",
        coverImageUrl: "",
        coverImageName: "",
        createdBy: "member-id",
        createdAt: "2026-05-25T10:00:00.000Z",
        updatedAt: "2026-05-25T11:00:00.000Z",
      },
    });

    const response = await PATCH(
      new Request("http://localhost/api/book-proposals/proposal-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer access-token",
        },
        body: JSON.stringify({
          title: "Normalni ludzie - nowe wydanie",
          description: "Aktualizacja",
        }),
      }),
      {
        params: Promise.resolve({
          proposalId: "proposal-1",
        }),
      },
    );

    expect(response.status).toBe(200);
    expect(mocks.mockUpdateBookProposal).toHaveBeenCalledWith(
      {
        proposalId: "proposal-1",
        title: "Normalni ludzie - nowe wydanie",
        author: undefined,
        description: "Aktualizacja",
        coverImageUrl: undefined,
        coverImageName: undefined,
      },
      "Bearer access-token",
    );
  });

  it("dispatches delete requests through the helper", async () => {
    mocks.mockDeleteBookProposal.mockResolvedValue({
      ok: true,
      status: 200,
      message: "Propozycja książki została usunięta.",
      proposalId: "proposal-1",
    });

    const response = await DELETE(
      new Request("http://localhost/api/book-proposals/proposal-1", {
        method: "DELETE",
        headers: {
          authorization: "Bearer access-token",
        },
      }),
      {
        params: Promise.resolve({
          proposalId: "proposal-1",
        }),
      },
    );

    expect(response.status).toBe(200);
    expect(mocks.mockDeleteBookProposal).toHaveBeenCalledWith("proposal-1", "Bearer access-token");
  });
});

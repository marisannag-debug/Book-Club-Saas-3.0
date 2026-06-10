import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProposalList from "../../app/components/voting/ProposalList";
import type { BookProposal } from "../../app/components/voting/types";

const mockCreateObjectURL = vi.fn();
const mockGetSession = vi.fn();
const mockFetch = vi.fn();

vi.mock("../../lib/supabase.browser", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}));

function buildResponse(payload: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

function buildProposal(overrides: Partial<BookProposal>): BookProposal {
  return {
    id: overrides.id ?? "proposal-1",
    title: overrides.title ?? "Normalni ludzie",
    author: overrides.author ?? "Sally Rooney",
    coverImageUrl: overrides.coverImageUrl ?? "data:image/png;base64,cover-preview",
    coverImageName: overrides.coverImageName ?? "cover.jpg",
    description: overrides.description ?? "Krótka, współczesna propozycja do spokojnej dyskusji.",
    createdBy: overrides.createdBy ?? "member-1",
    createdByLabel: overrides.createdByLabel ?? "Kasia",
    createdAt: overrides.createdAt ?? "21 maja 2026",
    updatedAt: overrides.updatedAt ?? "21 maja 2026",
    canManage: overrides.canManage ?? true,
    canEdit: overrides.canEdit ?? true,
    canDelete: overrides.canDelete ?? true,
    votesCount: overrides.votesCount ?? 0,
    currentUserHasVoted: overrides.currentUserHasVoted ?? false,
  };
}

beforeEach(() => {
  mockCreateObjectURL.mockReset();
  mockGetSession.mockReset();
  mockFetch.mockReset();
  mockGetSession.mockResolvedValue({
    data: {
      session: {
        access_token: "access-token",
      },
    },
  });
  vi.stubGlobal("fetch", mockFetch);
  vi.spyOn(URL, "createObjectURL").mockImplementation(mockCreateObjectURL);
});

describe("ProposalList", () => {
  it("loads, adds, edits and deletes proposals through the API", async () => {
    mockCreateObjectURL.mockReturnValue("blob:to-kill-a-mockingbird");
    mockFetch
      .mockResolvedValueOnce(
        buildResponse({
          ok: true,
          status: 200,
          clubId: "club-1",
          items: [buildProposal({ id: "proposal-1" }), buildProposal({ id: "proposal-2", title: "1984" })],
        }),
      )
      .mockResolvedValueOnce(
        buildResponse({
          ok: true,
          status: 201,
          message: "Propozycja książki została dodana.",
          proposal: buildProposal({
            id: "proposal-3",
            title: "Zabić drozda",
            author: "Harper Lee",
            description: "Klasyk do wspólnej dyskusji.",
            coverImageUrl: "blob:to-kill-a-mockingbird",
            coverImageName: "to-kill-a-mockingbird.jpg",
          }),
        }),
      )
      .mockResolvedValueOnce(
        buildResponse({
          ok: true,
          status: 200,
          clubId: "club-1",
          items: [
            buildProposal({
              id: "proposal-3",
              title: "Zabić drozda",
              author: "Harper Lee",
              coverImageUrl: "data:image/jpeg;base64,ZmFrZSBpbWFnZQ==",
              coverImageName: "to-kill-a-mockingbird.jpg",
              description: "Klasyk do wspólnej dyskusji.",
            }),
            buildProposal({ id: "proposal-1" }),
            buildProposal({ id: "proposal-2", title: "1984" }),
          ],
        }),
      )
      .mockResolvedValueOnce(
        buildResponse({
          ok: true,
          status: 200,
          message: "Propozycja książki została zaktualizowana.",
          proposal: buildProposal({
            id: "proposal-3",
            title: "Zabić drozda - wydanie klubowe",
            author: "Harper Lee",
            description: "Klasyk do wspólnej dyskusji.",
            coverImageUrl: "blob:to-kill-a-mockingbird",
            coverImageName: "to-kill-a-mockingbird.jpg",
          }),
        }),
      )
      .mockResolvedValueOnce(
        buildResponse({
          ok: true,
          status: 200,
          clubId: "club-1",
          items: [
            buildProposal({
              id: "proposal-3",
              title: "Zabić drozda - wydanie klubowe",
              author: "Harper Lee",
              coverImageUrl: "data:image/jpeg;base64,ZmFrZSBpbWFnZQ==",
              coverImageName: "to-kill-a-mockingbird.jpg",
              description: "Klasyk do wspólnej dyskusji.",
            }),
            buildProposal({ id: "proposal-1" }),
            buildProposal({ id: "proposal-2", title: "1984" }),
          ],
        }),
      )
      .mockResolvedValueOnce(
        buildResponse({
          ok: true,
          status: 200,
          message: "Propozycja książki została usunięta.",
          proposalId: "proposal-3",
        }),
      )
      .mockResolvedValueOnce(
        buildResponse({
          ok: true,
          status: 200,
          clubId: "club-1",
          items: [buildProposal({ id: "proposal-1" }), buildProposal({ id: "proposal-2", title: "1984" })],
        }),
      );

    render(
      <ProposalList
        clubId="club-1"
        clubName="Sunset Readers"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Normalni ludzie")).toBeInTheDocument();
      expect(screen.getByText("1984")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Tytuł książki"), {
      target: { value: "Zabić drozda" },
    });
    fireEvent.change(screen.getByLabelText("Autor"), {
      target: { value: "Harper Lee" },
    });
    const coverFile = new File(["fake image"], "to-kill-a-mockingbird.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(screen.getByLabelText("Grafika okładki"), {
      target: {
        files: [coverFile],
      },
    });
    fireEvent.change(screen.getByLabelText("Opis propozycji"), {
      target: { value: "Klasyk do wspólnej dyskusji." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Dodaj propozycję" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Zabić drozda" })).toBeInTheDocument();
    });

    expect(screen.getByAltText("Okładka książki Zabić drozda")).toHaveAttribute(
      "src",
      "data:image/jpeg;base64,ZmFrZSBpbWFnZQ==",
    );

    expect(screen.getByText("Dołączony plik: to-kill-a-mockingbird.jpg")).toBeInTheDocument();
    expect(screen.getByText("Propozycja książki została dodana.")).toBeInTheDocument();
    expect(screen.getByText("3 propozycje")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Edytuj" })[0]);
    fireEvent.change(screen.getByLabelText("Tytuł książki"), {
      target: { value: "Zabić drozda - wydanie klubowe" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Zapisz zmiany" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Zabić drozda - wydanie klubowe" })).toBeInTheDocument();
    });

    expect(screen.getByText("Propozycja książki została zaktualizowana.")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Usuń" })[0]);

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Zabić drozda - wydanie klubowe" })).not.toBeInTheDocument();
    });

    expect(screen.getByText("Propozycja książki została usunięta.")).toBeInTheDocument();
    expect(screen.getByText("2 propozycje")).toBeInTheDocument();

    expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/book-proposals?clubId=club-1", {
      cache: "no-store",
      headers: {
        Authorization: "Bearer access-token",
      },
    });
    expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/book-proposals", {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: "Bearer access-token",
      },
      body: expect.any(FormData),
    });
    expect(mockFetch).toHaveBeenNthCalledWith(3, "/api/book-proposals?clubId=club-1", {
      cache: "no-store",
      headers: {
        Authorization: "Bearer access-token",
      },
    });

    const createdBody = mockFetch.mock.calls[1]?.[1]?.body as FormData;

    expect(createdBody).toBeInstanceOf(FormData);
    expect(createdBody.get("clubId")).toBe("club-1");
    expect(createdBody.get("title")).toBe("Zabić drozda");
    expect(createdBody.get("author")).toBe("Harper Lee");
    expect(createdBody.get("description")).toBe("Klasyk do wspólnej dyskusji.");
    expect(createdBody.get("coverImageFile")).toBe(coverFile);
  });

  it("renders the empty state when the list has no proposals", async () => {
    mockFetch.mockResolvedValueOnce(
      buildResponse({
        ok: true,
        status: 200,
        clubId: "club-1",
        items: [],
      }),
    );

    render(<ProposalList clubId="club-1" clubName="Sunset Readers" initialProposals={[]} />);

    await waitFor(() => {
      expect(screen.getByText("Brak propozycji")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Dodaj pierwszą propozycję" })).toBeInTheDocument();
    });
  });

  it("shows vote controls and toggles the local vote state", async () => {
    mockFetch.mockResolvedValueOnce(
      buildResponse({
        ok: true,
        status: 200,
        clubId: "club-1",
        items: [buildProposal({ id: "proposal-1", votesCount: 0, currentUserHasVoted: false })],
      }),
    );
    mockFetch.mockResolvedValueOnce(
      buildResponse({
        ok: true,
        status: 201,
        message: "Głos został zapisany.",
        proposalId: "proposal-1",
      }),
    );
    mockFetch.mockResolvedValueOnce(
      buildResponse({
        ok: true,
        status: 200,
        clubId: "club-1",
        items: [buildProposal({ id: "proposal-1", votesCount: 1, currentUserHasVoted: true })],
      }),
    );

    render(<ProposalList clubId="club-1" clubName="Sunset Readers" />);

    await waitFor(() => {
      expect(screen.getByText("0 głosów")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Głosuj na Normalni ludzie" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Głosuj na Normalni ludzie" }));

    await waitFor(() => {
      expect(screen.getByText("1 głos")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cofnij głos dla Normalni ludzie" })).toBeInTheDocument();
      expect(screen.getByText("Głos został zapisany.")).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/votes", {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: "Bearer access-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ proposalId: "proposal-1" }),
    });

    expect(mockFetch).toHaveBeenNthCalledWith(3, "/api/book-proposals?clubId=club-1", {
      cache: "no-store",
      headers: {
        Authorization: "Bearer access-token",
      },
    });
  });

  it("hides management actions when the user cannot manage proposals", async () => {
    mockFetch.mockResolvedValueOnce(
      buildResponse({
        ok: true,
        status: 200,
        clubId: "club-1",
        items: [buildProposal({ id: "proposal-1", canManage: false })],
      }),
    );

    render(
      <ProposalList
        clubId="club-1"
        clubName="Sunset Readers"
        userCanManageProposals={false}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Edytuj" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Usuń" })).not.toBeInTheDocument();
      expect(screen.getByText(/nie masz uprawnień do zarządzania propozycjami/i)).toBeInTheDocument();
    });
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProposalList from "../../app/components/voting/ProposalList";
import type { BookProposal } from "../../app/components/voting/types";

const mockCreateObjectURL = vi.fn();

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
  };
}

describe("ProposalList", () => {
  it("adds, edits and deletes proposals in the local list", async () => {
    mockCreateObjectURL.mockReturnValue("blob:to-kill-a-mockingbird");

    vi.spyOn(URL, "createObjectURL").mockImplementation(mockCreateObjectURL);

    render(
      <ProposalList
        clubId="club-1"
        clubName="Sunset Readers"
        initialProposals={[buildProposal({ id: "proposal-1" }), buildProposal({ id: "proposal-2", title: "1984" })]}
      />,
    );

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

    expect(screen.getByAltText("Okładka książki Zabić drozda")).toHaveAttribute("src", "blob:to-kill-a-mockingbird");

    expect(screen.getByText("Dołączony plik: to-kill-a-mockingbird.jpg")).toBeInTheDocument();
    expect(screen.getByText("Propozycja została dodana lokalnie do listy.")).toBeInTheDocument();
    expect(screen.getByText("3 propozycje")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Edytuj" })[0]);
    fireEvent.change(screen.getByLabelText("Tytuł książki"), {
      target: { value: "Zabić drozda - wydanie klubowe" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Zapisz zmiany" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Zabić drozda - wydanie klubowe" })).toBeInTheDocument();
    });

    expect(screen.getByText("Propozycja została zaktualizowana lokalnie.")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Usuń" })[0]);

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Zabić drozda - wydanie klubowe" })).not.toBeInTheDocument();
    });

    expect(screen.getByText("Propozycja została usunięta z tej listy.")).toBeInTheDocument();
    expect(screen.getByText("2 propozycje")).toBeInTheDocument();
  });

  it("renders the empty state when the list has no proposals", () => {
    render(<ProposalList clubId="club-1" clubName="Sunset Readers" initialProposals={[]} />);

    expect(screen.getByText("Brak propozycji")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dodaj pierwszą propozycję" })).toBeInTheDocument();
  });

  it("hides management actions when the user cannot manage proposals", () => {
    render(
      <ProposalList
        clubId="club-1"
        clubName="Sunset Readers"
        initialProposals={[buildProposal({ id: "proposal-1", canManage: false })]}
        userCanManageProposals={false}
      />,
    );

    expect(screen.queryByRole("button", { name: "Edytuj" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Usuń" })).not.toBeInTheDocument();
    expect(screen.getByText(/nie masz uprawnień do zarządzania propozycjami/i)).toBeInTheDocument();
  });
});

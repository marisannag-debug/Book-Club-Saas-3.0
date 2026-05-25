import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MembershipActions from "../../app/components/club/MembershipActions";

const mockReplace = vi.fn();
const mockGetSession = vi.fn();
const mockFetch = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

vi.mock("../../lib/supabase.browser", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}));

beforeEach(() => {
  mockReplace.mockReset();
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
});

describe("MembershipActions", () => {
  it("loads the current membership and saves a renamed display name", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
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
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          status: 200,
          clubId: "club-1",
          clubName: "Sunset Readers",
          currentUserRole: "member",
          message: "Nazwa członka została zaktualizowana.",
          membership: {
            memberId: "membership-1",
            displayName: "Marta K.",
            status: "active",
            joinedAt: "2026-05-21",
            isCreator: false,
            canAccept: false,
            canLeave: true,
            canRename: true,
          },
        }),
      });

    render(<MembershipActions clubId="club-1" memberId="me" />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Sunset Readers" })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Twoja nazwa wyświetlana"), {
      target: { value: "Marta K." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Zapisz nazwę" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/membership", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer access-token",
      },
      body: JSON.stringify({
        clubId: "club-1",
        action: "rename",
        displayName: "Marta K.",
      }),
    });

    expect(screen.getAllByText("Nazwa członka została zaktualizowana.")).toHaveLength(2);
    expect(screen.getByDisplayValue("Marta K.")).toBeInTheDocument();
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MeetingPlannerWorkspace from "../../app/components/meetings/MeetingPlannerWorkspace";
import type { MeetingPoll } from "../../app/components/meetings/types";

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

function buildMeeting(overrides: Partial<MeetingPoll> = {}): MeetingPoll {
  return {
    id: overrides.id ?? "meeting-1",
    clubId: overrides.clubId ?? "club-1",
    clubName: overrides.clubName ?? "Sunset Readers",
    title: overrides.title ?? "Sunset Readers - planer spotkania",
    description:
      overrides.description ?? "Dodawaj propozycje pojedynczo i głosuj na najlepszy termin bez opuszczania tej podstrony.",
    status: overrides.status ?? "open",
    createdAtLabel: overrides.createdAtLabel ?? "10 czerwca 2026",
    updatedAtLabel: overrides.updatedAtLabel ?? "10 czerwca 2026",
    createdByLabel: overrides.createdByLabel ?? "Prowadzący",
    finalizedSlotId: overrides.finalizedSlotId ?? null,
    currentUserRole: overrides.currentUserRole ?? "host",
    currentUserVoteSlotId: overrides.currentUserVoteSlotId ?? null,
    slots: overrides.slots ?? [],
  };
}

beforeEach(() => {
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

describe("MeetingPlannerWorkspace", () => {
  it("adds a single slot through the backend", async () => {
    mockFetch.mockResolvedValueOnce(
      buildResponse({
        ok: true,
        slotId: "slot-1",
      }, 201),
    );

    render(
      <MeetingPlannerWorkspace
        clubId="club-1"
        clubName="Sunset Readers"
        initialMeeting={buildMeeting()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Nazwa propozycji"), {
      target: { value: "Wtorkowy wieczór" },
    });
    fireEvent.change(screen.getByLabelText("Data"), {
      target: { value: "2026-06-12" },
    });
    fireEvent.change(screen.getByLabelText("Godzina startu"), {
      target: { value: "18:30" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Dodaj propozycję" }));

    await waitFor(() => {
      expect(screen.getByText("Propozycja terminu została dodana. Możesz teraz głosować na tej samej stronie.")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Wtorkowy wieczór" })).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/meeting-slots", {
      method: "POST",
      headers: {
        Authorization: "Bearer access-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meetingId: "meeting-1",
        startAt: new Date("2026-06-12T18:30").toISOString(),
        endAt: null,
        label: "Wtorkowy wieczór",
      }),
    });
  });

  it("votes on a slot through the backend", async () => {
    mockFetch.mockResolvedValueOnce(
      buildResponse({
        ok: true,
        status: 201,
        message: "Głos został zapisany.",
        meetingId: "meeting-1",
      }, 201),
    );

    render(
      <MeetingPlannerWorkspace
        clubId="club-1"
        clubName="Sunset Readers"
        initialMeeting={buildMeeting({
          slots: [
            {
              id: "slot-1",
              label: "Wtorkowy wieczór",
              startLabel: "12 czerwca 2026 • 18:30",
              endLabel: "Brak czasu zakończenia",
              votesCount: 0,
              currentUserHasVoted: false,
              createdByIsCurrentUser: true,
              createdByLabel: "Ty",
            },
          ],
        })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Zagłosuj na Wtorkowy wieczór" }));

    await waitFor(() => {
      expect(screen.getByText("Twój wybór")).toBeInTheDocument();
      expect(screen.getByText("1 głos")).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/meeting-votes", {
      method: "POST",
      headers: {
        Authorization: "Bearer access-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meetingId: "meeting-1",
        slotId: "slot-1",
      }),
    });
  });
});

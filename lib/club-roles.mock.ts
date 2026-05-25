import type { ClubRolesViewModel } from "../app/components/club/roles";

function titleizeId(id: string) {
  return id
    .replace(/[-_]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildClubRolesMock(clubId: string): ClubRolesViewModel {
  const normalizedClubId = clubId.trim() || "demo-club";
  const clubName = titleizeId(normalizedClubId) || "Mój klub";
  const readOnlyMode = /member|readonly|podglad/i.test(normalizedClubId);

  return {
    clubId: normalizedClubId,
    clubName,
    currentUserRole: readOnlyMode ? "member" : "host",
    members: [
      {
        userId: "user-host-1",
        displayName: "Anna Kowalska",
        email: "anna@example.com",
        role: "host",
        joinedAt: "21 maja 2026",
        isCurrentUser: !readOnlyMode,
        isCreator: true,
      },
      {
        userId: "user-member-1",
        displayName: "Marta Nowak",
        email: "marta@example.com",
        role: readOnlyMode ? "host" : "member",
        joinedAt: "20 maja 2026",
        isCurrentUser: readOnlyMode,
      },
      {
        userId: "user-member-2",
        displayName: "Piotr Zielinski",
        email: "piotr@example.com",
        role: "member",
        joinedAt: "19 maja 2026",
      },
    ],
  };
}

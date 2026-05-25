export type ClubRole = "host" | "member";

export type ClubRoleMember = {
  userId: string;
  email: string | null;
  displayName: string;
  role: ClubRole;
  joinedAt: string;
  isCurrentUser?: boolean;
  isCreator?: boolean;
};

export type ClubRolesViewModel = {
  clubId: string;
  clubName: string;
  currentUserRole: ClubRole;
  members: ClubRoleMember[];
};

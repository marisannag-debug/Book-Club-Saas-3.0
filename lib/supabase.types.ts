import type { SupabaseClient } from "@supabase/supabase-js";

type ClubRole = "host" | "member";
type MembershipStatus = "pending" | "active" | "left";

type TableDefinition<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type ClubRow = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type ClubInviteRow = {
  id: string;
  club_id: string;
  invited_email: string | null;
  invited_by: string;
  invite_code: string;
  invite_token_hash: string;
  status: string;
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
  created_at: string;
  updated_at: string;
};

type ClubMemberRow = {
  id: string;
  club_id: string;
  user_id: string;
  joined_at: string;
  joined_via_invite_id: string | null;
  role: ClubRole | null;
  display_name: string | null;
  membership_status: MembershipStatus | null;
  updated_at: string | null;
};

type BookProposalRow = {
  id: string;
  club_id: string;
  title: string;
  author: string;
  description: string | null;
  cover_image_url: string | null;
  cover_image_name: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type SupabaseDatabase = {
  public: {
    Tables: {
      clubs: TableDefinition<
        ClubRow,
        Pick<ClubRow, "name" | "created_by"> & Partial<Pick<ClubRow, "id" | "description" | "created_at" | "updated_at">>
      >;
      club_invites: TableDefinition<
        ClubInviteRow,
        Pick<ClubInviteRow, "club_id" | "invited_by" | "invite_code" | "invite_token_hash" | "expires_at"> &
          Partial<Pick<ClubInviteRow, "id" | "invited_email" | "status" | "accepted_at" | "accepted_by" | "created_at" | "updated_at">>
      >;
      club_members: TableDefinition<
        ClubMemberRow,
        Pick<ClubMemberRow, "club_id" | "user_id"> &
          Partial<
            Pick<
              ClubMemberRow,
              "id" | "joined_at" | "joined_via_invite_id" | "role" | "display_name" | "membership_status" | "updated_at"
            >
          >
      >;
      book_proposals: TableDefinition<
        BookProposalRow,
        Pick<BookProposalRow, "club_id" | "title" | "author" | "created_by"> &
          Partial<
            Pick<
              BookProposalRow,
              "id" | "description" | "cover_image_url" | "cover_image_name" | "created_at" | "updated_at"
            >
          >
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type SupabaseAppClient = SupabaseClient<SupabaseDatabase>;

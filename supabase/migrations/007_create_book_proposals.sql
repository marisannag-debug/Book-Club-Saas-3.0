BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS book_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text NOT NULL,
  description text,
  cover_image_url text,
  cover_image_name text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT book_proposals_title_length CHECK (char_length(title) BETWEEN 3 AND 120),
  CONSTRAINT book_proposals_author_length CHECK (char_length(author) BETWEEN 2 AND 120),
  CONSTRAINT book_proposals_description_length CHECK (description IS NULL OR char_length(description) <= 280),
  CONSTRAINT book_proposals_cover_image_name_length CHECK (cover_image_name IS NULL OR char_length(cover_image_name) <= 255)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE book_proposals TO authenticated, service_role;

CREATE INDEX IF NOT EXISTS book_proposals_club_created_at_idx
  ON book_proposals (club_id, created_at DESC);

CREATE INDEX IF NOT EXISTS book_proposals_club_created_by_idx
  ON book_proposals (club_id, created_by);

ALTER TABLE book_proposals ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION update_book_proposals_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS book_proposals_updated_at_trigger ON book_proposals;
CREATE TRIGGER book_proposals_updated_at_trigger
BEFORE UPDATE ON book_proposals
FOR EACH ROW
EXECUTE FUNCTION update_book_proposals_updated_at();

DROP POLICY IF EXISTS allow_member_read_book_proposals ON book_proposals;
CREATE POLICY allow_member_read_book_proposals ON book_proposals
  FOR SELECT
  USING (
    user_is_member_of_club(club_id)
    OR user_is_host_of_club(club_id)
  );

DROP POLICY IF EXISTS allow_member_create_book_proposals ON book_proposals;
CREATE POLICY allow_member_create_book_proposals ON book_proposals
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND (
      user_is_member_of_club(club_id)
      OR user_is_host_of_club(club_id)
    )
  );

DROP POLICY IF EXISTS allow_owner_or_host_update_book_proposals ON book_proposals;
CREATE POLICY allow_owner_or_host_update_book_proposals ON book_proposals
  FOR UPDATE
  USING (
    auth.uid() = created_by
    OR user_is_host_of_club(club_id)
  )
  WITH CHECK (
    auth.uid() = created_by
    OR user_is_host_of_club(club_id)
  );

DROP POLICY IF EXISTS allow_owner_or_host_delete_book_proposals ON book_proposals;
CREATE POLICY allow_owner_or_host_delete_book_proposals ON book_proposals
  FOR DELETE
  USING (
    auth.uid() = created_by
    OR user_is_host_of_club(club_id)
  );

COMMIT;

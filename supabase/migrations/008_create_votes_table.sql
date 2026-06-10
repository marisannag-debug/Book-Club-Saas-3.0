BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES book_proposals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT votes_proposal_user_unique UNIQUE (proposal_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON TABLE votes TO authenticated, service_role;

CREATE INDEX IF NOT EXISTS votes_proposal_id_idx
  ON votes (proposal_id);

CREATE INDEX IF NOT EXISTS votes_user_id_idx
  ON votes (user_id);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_member_read_votes ON votes;
CREATE POLICY allow_member_read_votes ON votes
  FOR SELECT
  USING (
    user_is_member_of_club(
      (SELECT club_id FROM book_proposals WHERE book_proposals.id = votes.proposal_id)
    )
    OR user_is_host_of_club(
      (SELECT club_id FROM book_proposals WHERE book_proposals.id = votes.proposal_id)
    )
  );

DROP POLICY IF EXISTS allow_member_create_votes ON votes;
CREATE POLICY allow_member_create_votes ON votes
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND user_is_member_of_club(
      (SELECT club_id FROM book_proposals WHERE book_proposals.id = votes.proposal_id)
    )
  );

DROP POLICY IF EXISTS allow_owner_delete_votes ON votes;
CREATE POLICY allow_owner_delete_votes ON votes
  FOR DELETE
  USING (auth.uid() = user_id);

COMMIT;
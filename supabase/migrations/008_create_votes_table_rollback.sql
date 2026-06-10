BEGIN;

DROP POLICY IF EXISTS allow_member_read_votes ON votes;
DROP POLICY IF EXISTS allow_member_create_votes ON votes;
DROP POLICY IF EXISTS allow_owner_delete_votes ON votes;

DROP INDEX IF EXISTS votes_proposal_id_idx;
DROP INDEX IF EXISTS votes_user_id_idx;

DROP TABLE IF EXISTS votes;

COMMIT;
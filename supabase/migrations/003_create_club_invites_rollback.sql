BEGIN;

DROP TRIGGER IF EXISTS club_invites_updated_at_trigger ON club_invites;
DROP FUNCTION IF EXISTS update_club_invites_updated_at();

DROP POLICY IF EXISTS "Allow user to read own membership" ON club_members;
DROP POLICY IF EXISTS "Allow club owner to manage members" ON club_members;
DROP POLICY IF EXISTS "Allow invited user to read matching invite" ON club_invites;
DROP POLICY IF EXISTS "Allow club owner to manage invites" ON club_invites;

DROP INDEX IF EXISTS club_members_user_id_idx;
DROP INDEX IF EXISTS club_members_club_id_idx;
DROP INDEX IF EXISTS club_invites_expires_at_idx;
DROP INDEX IF EXISTS club_invites_invite_code_idx;
DROP INDEX IF EXISTS club_invites_club_id_idx;

DROP TABLE IF EXISTS club_members;
DROP TABLE IF EXISTS club_invites;

COMMIT;
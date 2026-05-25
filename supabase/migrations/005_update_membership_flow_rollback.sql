BEGIN;

DROP POLICY IF EXISTS allow_member_create_own_membership ON club_members;
DROP POLICY IF EXISTS allow_host_manage_membership ON club_members;
DROP POLICY IF EXISTS allow_member_update_own_membership ON club_members;
DROP POLICY IF EXISTS allow_member_read_own_membership ON club_members;

DROP TRIGGER IF EXISTS club_members_updated_at_trigger ON club_members;
DROP FUNCTION IF EXISTS update_club_members_updated_at();

DROP INDEX IF EXISTS club_members_user_status_idx;
DROP INDEX IF EXISTS club_members_club_status_idx;

ALTER TABLE club_members
  DROP CONSTRAINT IF EXISTS club_members_membership_status_check;

ALTER TABLE club_members
  DROP COLUMN IF EXISTS updated_at,
  DROP COLUMN IF EXISTS membership_status,
  DROP COLUMN IF EXISTS display_name;

DROP POLICY IF EXISTS "Allow user to read own membership" ON club_members;
DROP POLICY IF EXISTS "Allow club owner to manage members" ON club_members;

COMMIT;

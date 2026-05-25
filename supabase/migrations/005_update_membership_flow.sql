BEGIN;

ALTER TABLE club_members
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS membership_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE club_members
  DROP CONSTRAINT IF EXISTS club_members_membership_status_check;

ALTER TABLE club_members
  ADD CONSTRAINT club_members_membership_status_check
  CHECK (membership_status IN ('pending', 'active', 'left'));

CREATE INDEX IF NOT EXISTS club_members_club_status_idx
  ON club_members (club_id, membership_status);

CREATE INDEX IF NOT EXISTS club_members_user_status_idx
  ON club_members (user_id, membership_status);

CREATE OR REPLACE FUNCTION update_club_members_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS club_members_updated_at_trigger ON club_members;
CREATE TRIGGER club_members_updated_at_trigger
BEFORE UPDATE ON club_members
FOR EACH ROW
EXECUTE FUNCTION update_club_members_updated_at();

DROP POLICY IF EXISTS "Allow user to read own membership" ON club_members;
DROP POLICY IF EXISTS allow_member_to_read_club_membership ON club_members;
DROP POLICY IF EXISTS allow_member_read_own_membership ON club_members;
CREATE POLICY allow_member_read_own_membership ON club_members
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_is_host_of_club(club_id)
    OR user_is_member_of_club(club_id)
  );

DROP POLICY IF EXISTS allow_member_update_own_membership ON club_members;
CREATE POLICY allow_member_update_own_membership ON club_members
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow club owner to manage members" ON club_members;
DROP POLICY IF EXISTS allow_host_to_manage_members ON club_members;
DROP POLICY IF EXISTS allow_host_manage_membership ON club_members;
CREATE POLICY allow_host_manage_membership ON club_members
  FOR ALL
  USING (user_is_host_of_club(club_id))
  WITH CHECK (user_is_host_of_club(club_id));

DROP POLICY IF EXISTS allow_member_create_own_membership ON club_members;
CREATE POLICY allow_member_create_own_membership ON club_members
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR user_is_host_of_club(club_id)
  );

COMMIT;

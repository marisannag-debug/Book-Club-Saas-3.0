BEGIN;

ALTER TABLE club_members
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member';

ALTER TABLE club_members
  DROP CONSTRAINT IF EXISTS club_members_role_check;

ALTER TABLE club_members
  ADD CONSTRAINT club_members_role_check
  CHECK (role IN ('member', 'host'));

CREATE INDEX IF NOT EXISTS club_members_club_role_idx
  ON club_members (club_id, role);

CREATE OR REPLACE FUNCTION user_is_host_of_club(target_club_id uuid)
RETURNS boolean
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM clubs c
    WHERE c.id = target_club_id
      AND c.created_by = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM club_members cm
    WHERE cm.club_id = target_club_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'host'
  );
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION user_is_host_of_club(uuid) SECURITY DEFINER;
ALTER FUNCTION user_is_host_of_club(uuid) SET search_path = public, auth;

DROP POLICY IF EXISTS allow_host_to_manage_members ON club_members;
CREATE POLICY allow_host_to_manage_members ON club_members
  FOR ALL
  USING (user_is_host_of_club(club_members.club_id))
  WITH CHECK (user_is_host_of_club(club_members.club_id));

DROP POLICY IF EXISTS allow_member_to_read_club_membership ON club_members;
CREATE POLICY allow_member_to_read_club_membership ON club_members
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_is_host_of_club(club_members.club_id)
    OR user_is_member_of_club(club_members.club_id)
  );

COMMIT;

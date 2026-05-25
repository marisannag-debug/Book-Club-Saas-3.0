BEGIN;

DROP POLICY IF EXISTS allow_host_to_manage_members ON club_members;
DROP POLICY IF EXISTS allow_member_to_read_club_membership ON club_members;

CREATE POLICY "Allow club owner to manage members" ON club_members
  FOR ALL
  USING (EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_members.club_id AND c.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_members.club_id AND c.created_by = auth.uid()));

CREATE POLICY "Allow user to read own membership" ON club_members
  FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_members.club_id AND c.created_by = auth.uid()));

DROP FUNCTION IF EXISTS user_is_host_of_club(uuid);
DROP INDEX IF EXISTS club_members_club_role_idx;

ALTER TABLE club_members
  DROP CONSTRAINT IF EXISTS club_members_role_check;

ALTER TABLE club_members
  DROP COLUMN IF EXISTS role;

COMMIT;

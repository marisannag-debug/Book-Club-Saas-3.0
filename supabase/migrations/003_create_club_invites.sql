BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS club_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  invited_email text,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text NOT NULL UNIQUE,
  invite_token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  accepted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT club_invites_status_check CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  CONSTRAINT club_invites_email_length CHECK (invited_email IS NULL OR char_length(invited_email) BETWEEN 3 AND 254)
);

CREATE TABLE IF NOT EXISTS club_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  joined_via_invite_id uuid REFERENCES club_invites(id) ON DELETE SET NULL,
  CONSTRAINT club_members_unique UNIQUE (club_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE club_invites TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE club_members TO authenticated, service_role;

CREATE INDEX IF NOT EXISTS club_invites_club_id_idx ON club_invites (club_id);
CREATE INDEX IF NOT EXISTS club_invites_invite_code_idx ON club_invites (invite_code);
CREATE INDEX IF NOT EXISTS club_invites_expires_at_idx ON club_invites (expires_at);
CREATE INDEX IF NOT EXISTS club_members_club_id_idx ON club_members (club_id);
CREATE INDEX IF NOT EXISTS club_members_user_id_idx ON club_members (user_id);

ALTER TABLE club_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow club owner to manage invites" ON club_invites;
CREATE POLICY "Allow club owner to manage invites" ON club_invites
  FOR ALL
  USING (EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_invites.club_id AND c.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_invites.club_id AND c.created_by = auth.uid()));

DROP POLICY IF EXISTS "Allow invited user to read matching invite" ON club_invites;
CREATE POLICY "Allow invited user to read matching invite" ON club_invites
  FOR SELECT
  USING (
    auth.uid() = accepted_by
    OR (invited_email IS NOT NULL AND lower(invited_email) = lower(coalesce(auth.email(), '')))
    OR EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_invites.club_id AND c.created_by = auth.uid())
  );

DROP POLICY IF EXISTS "Allow club owner to manage members" ON club_members;
CREATE POLICY "Allow club owner to manage members" ON club_members
  FOR ALL
  USING (EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_members.club_id AND c.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_members.club_id AND c.created_by = auth.uid()));

DROP POLICY IF EXISTS "Allow user to read own membership" ON club_members;
CREATE POLICY "Allow user to read own membership" ON club_members
  FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_members.club_id AND c.created_by = auth.uid()));

CREATE OR REPLACE FUNCTION update_club_invites_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS club_invites_updated_at_trigger ON club_invites;
CREATE TRIGGER club_invites_updated_at_trigger
BEFORE UPDATE ON club_invites
FOR EACH ROW
EXECUTE FUNCTION update_club_invites_updated_at();

COMMIT;
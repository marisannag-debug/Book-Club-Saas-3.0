BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- club_meetings: container for one meeting poll
CREATE TABLE IF NOT EXISTS club_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'draft',
  finalized_slot_id uuid,
  finalized_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT club_meetings_status_check CHECK (status IN ('draft','open','closed','finalized'))
);

-- club_meeting_slots: individual proposed time slots
CREATE TABLE IF NOT EXISTS club_meeting_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES club_meetings(id) ON DELETE CASCADE,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  label text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- club_meeting_slot_votes: votes by user for a meeting (one vote per meeting)
CREATE TABLE IF NOT EXISTS club_meeting_slot_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES club_meetings(id) ON DELETE CASCADE,
  slot_id uuid NOT NULL REFERENCES club_meeting_slots(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_meeting_vote_per_user UNIQUE (meeting_id, user_id)
);

-- Table privileges (RLS still applies on top of these grants)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE club_meetings TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE club_meeting_slots TO authenticated, service_role;
GRANT SELECT, INSERT, DELETE ON TABLE club_meeting_slot_votes TO authenticated, service_role;

-- Indexes
CREATE INDEX IF NOT EXISTS club_meetings_club_id_idx ON club_meetings (club_id);
CREATE INDEX IF NOT EXISTS club_meetings_created_by_idx ON club_meetings (created_by);
CREATE INDEX IF NOT EXISTS club_meeting_slots_meeting_id_idx ON club_meeting_slots (meeting_id);
CREATE INDEX IF NOT EXISTS club_meeting_slots_start_at_idx ON club_meeting_slots (start_at);
CREATE INDEX IF NOT EXISTS club_meeting_slots_created_by_idx ON club_meeting_slots (created_by);
CREATE INDEX IF NOT EXISTS club_meeting_slot_votes_meeting_id_idx ON club_meeting_slot_votes (meeting_id);
CREATE INDEX IF NOT EXISTS club_meeting_slot_votes_user_id_idx ON club_meeting_slot_votes (user_id);

-- Enable RLS
ALTER TABLE club_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_meeting_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_meeting_slot_votes ENABLE ROW LEVEL SECURITY;

-- Policies
-- Read meetings: club members or meeting creator
DROP POLICY IF EXISTS allow_member_read_meetings ON club_meetings;
CREATE POLICY allow_member_read_meetings ON club_meetings
  FOR SELECT
  USING (
    auth.uid() = created_by
    OR user_is_member_of_club(club_meetings.club_id)
  );

-- Create meeting: any member may create
DROP POLICY IF EXISTS allow_member_create_meetings ON club_meetings;
CREATE POLICY allow_member_create_meetings ON club_meetings
  FOR INSERT
  WITH CHECK (
    user_is_member_of_club(club_id)
    OR auth.uid() = created_by
  );

-- Manage meetings (update/delete): only club owner or meeting creator
DROP POLICY IF EXISTS allow_owner_or_host_manage_meetings ON club_meetings;
CREATE POLICY allow_owner_or_host_manage_meetings ON club_meetings
  FOR ALL
  USING (
    auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_meetings.club_id AND c.created_by = auth.uid())
  )
  WITH CHECK (
    auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_meetings.club_id AND c.created_by = auth.uid())
  );

-- Read slots: members of the meeting's club or meeting creator
DROP POLICY IF EXISTS allow_member_read_meeting_slots ON club_meeting_slots;
CREATE POLICY allow_member_read_meeting_slots ON club_meeting_slots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM club_meetings m
      WHERE m.id = club_meeting_slots.meeting_id
      AND (
        auth.uid() = m.created_by
        OR user_is_member_of_club(m.club_id)
      )
    )
  );

-- Create slots: any club member may add a slot to an existing meeting
DROP POLICY IF EXISTS allow_member_create_meeting_slots ON club_meeting_slots;
CREATE POLICY allow_member_create_meeting_slots ON club_meeting_slots
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM club_meetings m
      WHERE m.id = club_meeting_slots.meeting_id
      AND (
        auth.uid() = m.created_by
        OR user_is_member_of_club(m.club_id)
      )
    )
  );

-- Delete/Update slots: only slot author or club owner (host)
DROP POLICY IF EXISTS allow_member_manage_meeting_slots ON club_meeting_slots;
CREATE POLICY allow_member_manage_meeting_slots ON club_meeting_slots
  FOR ALL
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM club_meetings m JOIN clubs c ON c.id = m.club_id
      WHERE m.id = club_meeting_slots.meeting_id
      AND c.created_by = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM club_meetings m JOIN clubs c ON c.id = m.club_id
      WHERE m.id = club_meeting_slots.meeting_id
      AND c.created_by = auth.uid()
    )
  );

-- Votes: allow insert by authenticated club member when meeting is open; enforce one vote per meeting via unique constraint
DROP POLICY IF EXISTS allow_member_vote_slots ON club_meeting_slot_votes;
CREATE POLICY allow_member_vote_slots ON club_meeting_slot_votes
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM club_meetings m
      WHERE m.id = club_meeting_slot_votes.meeting_id
      AND m.status = 'open'
      AND (
        auth.uid() = m.created_by
        OR user_is_member_of_club(m.club_id)
      )
    )
  );

-- Allow reading votes for members (used by aggregate queries on server-side)
DROP POLICY IF EXISTS allow_member_read_votes ON club_meeting_slot_votes;
CREATE POLICY allow_member_read_votes ON club_meeting_slot_votes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM club_meetings m
      WHERE m.id = club_meeting_slot_votes.meeting_id
      AND (
        auth.uid() = m.created_by
        OR user_is_member_of_club(m.club_id)
      )
    )
  );

-- Triggers: update updated_at timestamps
CREATE OR REPLACE FUNCTION update_club_meetings_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS club_meetings_updated_at_trigger ON club_meetings;
CREATE TRIGGER club_meetings_updated_at_trigger
BEFORE UPDATE ON club_meetings
FOR EACH ROW
EXECUTE FUNCTION update_club_meetings_updated_at();

CREATE OR REPLACE FUNCTION update_club_meeting_slots_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS club_meeting_slots_updated_at_trigger ON club_meeting_slots;
CREATE TRIGGER club_meeting_slots_updated_at_trigger
BEFORE UPDATE ON club_meeting_slots
FOR EACH ROW
EXECUTE FUNCTION update_club_meeting_slots_updated_at();

COMMIT;

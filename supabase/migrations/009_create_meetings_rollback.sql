BEGIN;

DROP POLICY IF EXISTS allow_member_vote_slots ON club_meeting_slot_votes;
DROP POLICY IF EXISTS allow_member_manage_meeting_slots ON club_meeting_slots;
DROP POLICY IF EXISTS allow_member_create_meeting_slots ON club_meeting_slots;
DROP POLICY IF EXISTS allow_member_read_meeting_slots ON club_meeting_slots;
DROP POLICY IF EXISTS allow_owner_or_host_manage_meetings ON club_meetings;
DROP POLICY IF EXISTS allow_member_create_meetings ON club_meetings;
DROP POLICY IF EXISTS allow_member_read_meetings ON club_meetings;
DROP POLICY IF EXISTS allow_member_read_votes ON club_meeting_slot_votes;

DROP TRIGGER IF EXISTS club_meeting_slots_updated_at_trigger ON club_meeting_slots;
DROP TRIGGER IF EXISTS club_meetings_updated_at_trigger ON club_meetings;

DROP TABLE IF EXISTS club_meeting_slot_votes;
DROP TABLE IF EXISTS club_meeting_slots;
DROP TABLE IF EXISTS club_meetings;

COMMIT;

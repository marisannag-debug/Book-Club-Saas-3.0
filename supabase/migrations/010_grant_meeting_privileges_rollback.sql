BEGIN;

REVOKE SELECT, INSERT, DELETE ON TABLE club_meeting_slot_votes FROM authenticated, service_role;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE club_meeting_slots FROM authenticated, service_role;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE club_meetings FROM authenticated, service_role;

COMMIT;

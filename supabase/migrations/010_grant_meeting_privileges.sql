BEGIN;

-- Stage 14 follow-up: migration 009 created the meeting tables but did not grant
-- table privileges to the `authenticated` / `service_role` roles like every other
-- table migration does. Without these grants PostgREST rejects queries made with a
-- user JWT ("permission denied for table club_meetings"), which surfaced as an HTTP
-- 400 when opening the meeting planner. RLS policies only take effect once the role
-- also holds the underlying table privileges, so we grant them here. Idempotent.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE club_meetings TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE club_meeting_slots TO authenticated, service_role;
GRANT SELECT, INSERT, DELETE ON TABLE club_meeting_slot_votes TO authenticated, service_role;

COMMIT;

-- revert_007_create_meetings.sql
-- Rollback for 007_create_meetings.sql
-- Generated: 2026-05-04

BEGIN;

DROP TABLE IF EXISTS meetings CASCADE;

COMMIT;

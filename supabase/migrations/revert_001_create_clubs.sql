-- revert_001_create_clubs.sql
-- Rollback for 001_create_clubs.sql
-- Generated: 2026-05-04

BEGIN;

DROP TABLE IF EXISTS clubs CASCADE;

COMMIT;

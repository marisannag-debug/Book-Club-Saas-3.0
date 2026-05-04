-- revert_004_create_votes.sql
-- Rollback for 004_create_votes.sql
-- Generated: 2026-05-04

BEGIN;

DROP TABLE IF EXISTS votes CASCADE;

COMMIT;

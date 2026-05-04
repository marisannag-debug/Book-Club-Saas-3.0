-- revert_005_create_vote_options.sql
-- Rollback for 005_create_vote_options.sql
-- Generated: 2026-05-04

BEGIN;

DROP TABLE IF EXISTS vote_options CASCADE;

COMMIT;

-- revert_006_create_submissions.sql
-- Rollback for 006_create_submissions.sql
-- Generated: 2026-05-04

BEGIN;

DROP TABLE IF EXISTS submissions CASCADE;

COMMIT;

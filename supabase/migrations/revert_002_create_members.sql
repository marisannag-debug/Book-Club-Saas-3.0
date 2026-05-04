-- revert_002_create_members.sql
-- Rollback for 002_create_members.sql
-- Generated: 2026-05-04

BEGIN;

DROP TABLE IF EXISTS members CASCADE;

COMMIT;

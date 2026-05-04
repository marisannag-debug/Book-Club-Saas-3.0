-- revert_008_create_messages.sql
-- Rollback for 008_create_messages.sql
-- Generated: 2026-05-04

BEGIN;

DROP TABLE IF EXISTS messages CASCADE;

COMMIT;

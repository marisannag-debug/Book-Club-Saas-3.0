-- revert_000_init_users.sql
-- Rollback for 000_init_users.sql
-- Generated: 2026-05-04

BEGIN;

DROP TABLE IF EXISTS users CASCADE;

COMMIT;

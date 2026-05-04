-- revert_003_create_books.sql
-- Rollback for 003_create_books.sql
-- Generated: 2026-05-04

BEGIN;

DROP TABLE IF EXISTS books CASCADE;

COMMIT;

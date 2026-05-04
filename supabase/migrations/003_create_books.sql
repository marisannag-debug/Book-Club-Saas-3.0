-- 003_create_books.sql
-- Create books table (optional catalog)
-- Generated: 2026-05-04

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text,
  isbn text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;

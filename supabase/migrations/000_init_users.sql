-- 000_init_users.sql
-- Initial migration: create `users` table
-- Generated: 2026-05-04

BEGIN;

-- ensure helper extension for UUID generation (harmless if already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;

-- 005_create_vote_options.sql
-- Create vote options table
-- Generated: 2026-05-04

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS vote_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id uuid NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vote_id, title)
);

COMMIT;

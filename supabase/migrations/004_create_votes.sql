-- 004_create_votes.sql
-- Create votes table
-- Generated: 2026-05-04

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES clubs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deadline timestamptz,
  is_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;

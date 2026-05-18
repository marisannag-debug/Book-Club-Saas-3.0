BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clubs_name_length CHECK (char_length(name) BETWEEN 3 AND 60),
  CONSTRAINT clubs_description_length CHECK (description IS NULL OR char_length(description) <= 240)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE clubs TO authenticated, service_role;

CREATE INDEX IF NOT EXISTS clubs_created_by_idx ON clubs (created_by);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated insert own club" ON clubs;
CREATE POLICY "Allow authenticated insert own club" ON clubs
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Allow authenticated select own club" ON clubs;
CREATE POLICY "Allow authenticated select own club" ON clubs
  FOR SELECT
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Allow authenticated update own club" ON clubs;
CREATE POLICY "Allow authenticated update own club" ON clubs
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Allow authenticated delete own club" ON clubs;
CREATE POLICY "Allow authenticated delete own club" ON clubs
  FOR DELETE
  USING (auth.uid() = created_by);

CREATE OR REPLACE FUNCTION update_clubs_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clubs_updated_at_trigger ON clubs;
CREATE TRIGGER clubs_updated_at_trigger
BEFORE UPDATE ON clubs
FOR EACH ROW
EXECUTE FUNCTION update_clubs_updated_at();

COMMIT;
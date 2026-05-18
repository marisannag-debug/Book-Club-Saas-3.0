BEGIN;

DROP TRIGGER IF EXISTS clubs_updated_at_trigger ON clubs;
DROP FUNCTION IF EXISTS update_clubs_updated_at();

DROP POLICY IF EXISTS "Allow authenticated delete own club" ON clubs;
DROP POLICY IF EXISTS "Allow authenticated update own club" ON clubs;
DROP POLICY IF EXISTS "Allow authenticated select own club" ON clubs;
DROP POLICY IF EXISTS "Allow authenticated insert own club" ON clubs;

DROP INDEX IF EXISTS clubs_created_by_idx;

DROP TABLE IF EXISTS clubs;

COMMIT;
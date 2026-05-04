-- rollback for 001_enable_rls_and_policies.sql
BEGIN;

DROP POLICY IF EXISTS "Allow authenticated select own" ON users;
DROP POLICY IF EXISTS "Allow authenticated insert" ON users;
DROP POLICY IF EXISTS "Allow authenticated update own" ON users;
DROP POLICY IF EXISTS "Allow authenticated delete own" ON users;

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

COMMIT;

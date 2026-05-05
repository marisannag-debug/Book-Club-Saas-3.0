-- 001_enable_rls_and_policies.sql
-- Enable Row Level Security and add example policies for `users` table
BEGIN;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to SELECT their own row
CREATE POLICY "Allow authenticated select own" ON users
  FOR SELECT USING (auth.role() = 'authenticated' AND auth.uid() = id);

-- Allow authenticated users to INSERT (basic example)
CREATE POLICY "Allow authenticated insert" ON users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to UPDATE their own row
CREATE POLICY "Allow authenticated update own" ON users
  FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to DELETE their own row
CREATE POLICY "Allow authenticated delete own" ON users
  FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = id);

COMMIT;

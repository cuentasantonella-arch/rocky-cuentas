-- Migration: Fix RLS policies for clients table
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. Disable RLS temporarily to make changes
-- ============================================
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Drop existing policies if they exist
-- ============================================
DROP POLICY IF EXISTS "Allow read all clients" ON clients;
DROP POLICY IF EXISTS "Allow insert all clients" ON clients;
DROP POLICY IF EXISTS "Allow update all clients" ON clients;
DROP POLICY IF EXISTS "Allow delete all clients" ON clients;
DROP POLICY IF EXISTS "Allow read own clients" ON clients;
DROP POLICY IF EXISTS "Allow insert own clients" ON clients;

-- ============================================
-- 3. Create permissive policies for development
-- ============================================

-- Allow anyone (including anon) to read clients
CREATE POLICY "Allow read all clients" ON clients
  FOR SELECT
  USING (true);

-- Allow anyone to insert clients
CREATE POLICY "Allow insert all clients" ON clients
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update clients
CREATE POLICY "Allow update all clients" ON clients
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete clients
CREATE POLICY "Allow delete all clients" ON clients
  FOR DELETE
  USING (true);

-- ============================================
-- 4. Enable RLS
-- ============================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. Verify the table structure
-- ============================================
-- Make sure 'name' column exists and is TEXT type
-- If not, you may need to add it:
-- ALTER TABLE clients ADD COLUMN IF NOT EXISTS name TEXT;
-- ALTER TABLE clients ADD COLUMN IF NOT EXISTS email TEXT;
-- ALTER TABLE clients ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'collaborator';
-- ALTER TABLE clients ADD COLUMN IF NOT EXISTS password TEXT;

-- ============================================
-- 6. Test: Verify you can select
-- ============================================
-- SELECT * FROM clients LIMIT 10;

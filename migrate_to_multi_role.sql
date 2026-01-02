-- Migration Script: Convert Single Role to Multi-Role Support
-- Run this script in your Supabase SQL Editor to enable multi-role support

-- ============================================================================
-- STEP 1: Drop existing RLS policies FIRST (they depend on the role column)
-- ============================================================================
DROP POLICY IF EXISTS "Everyone can view active events" ON events;
DROP POLICY IF EXISTS "Only admins can insert events" ON events;
DROP POLICY IF EXISTS "Only admins can update events" ON events;
DROP POLICY IF EXISTS "Only admins can delete events" ON events;
DROP POLICY IF EXISTS "Only admins can manage positions" ON positions;
DROP POLICY IF EXISTS "Only admins can manage nominees" ON nominees;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can view own votes" ON votes;
DROP POLICY IF EXISTS "Admins can view all votes" ON votes;

-- ============================================================================
-- STEP 2: Add new roles column
-- ============================================================================
ALTER TABLE users ADD COLUMN roles JSONB;

-- ============================================================================
-- STEP 3: Migrate existing data (convert single role to array)
-- ============================================================================
UPDATE users SET roles = jsonb_build_array(role);

-- ============================================================================
-- STEP 4: Make roles column NOT NULL and set default
-- ============================================================================
ALTER TABLE users ALTER COLUMN roles SET NOT NULL;
ALTER TABLE users ALTER COLUMN roles SET DEFAULT '["voter"]';

-- ============================================================================
-- STEP 5: Add constraint to validate JSONB array type
-- ============================================================================
ALTER TABLE users ADD CONSTRAINT valid_roles CHECK (jsonb_typeof(roles) = 'array');

-- ============================================================================
-- STEP 6: Drop old role column (now safe since policies are dropped)
-- ============================================================================
ALTER TABLE users DROP COLUMN role;

-- ============================================================================
-- STEP 7: Recreate RLS policies with multi-role support
-- ============================================================================

-- Events policies
CREATE POLICY "Everyone can view active events" ON events
  FOR SELECT USING (status = 'active' OR auth.uid() IN (
    SELECT id FROM users WHERE roles @> '["admin"]'
  ));

CREATE POLICY "Only admins can insert events" ON events
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT id FROM users WHERE roles @> '["admin"]'
  ));

CREATE POLICY "Only admins can update events" ON events
  FOR UPDATE USING (auth.uid() IN (
    SELECT id FROM users WHERE roles @> '["admin"]'
  ));

CREATE POLICY "Only admins can delete events" ON events
  FOR DELETE USING (auth.uid() IN (
    SELECT id FROM users WHERE roles @> '["admin"]'
  ));

-- Positions policies
CREATE POLICY "Only admins can manage positions" ON positions
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM users WHERE roles @> '["admin"]'
  ));

-- Nominees policies
CREATE POLICY "Only admins can manage nominees" ON nominees
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM users WHERE roles @> '["admin"]'
  ));

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM users WHERE roles @> '["admin"]'
  ));

-- Votes policies
CREATE POLICY "Users can view own votes" ON votes
  FOR SELECT USING (auth.uid() = voter_id OR auth.uid() IN (
    SELECT id FROM users WHERE roles @> '["admin"]'
  ));

CREATE POLICY "Admins can view all votes" ON votes
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM users WHERE roles @> '["admin"]'
  ));

-- ============================================================================
-- VERIFICATION: Check the migration
-- ============================================================================
-- Uncomment to verify all users have roles as JSONB arrays:
-- SELECT id, email, roles, jsonb_typeof(roles) as roles_type FROM users;

-- Expected output: roles_type should be 'array' for all users

-- =====================================================
-- FIX RLS POLICIES - Add INSERT, UPDATE, DELETE policies
-- =====================================================
-- Run this script in Supabase SQL Editor to fix RLS policies
-- This allows INSERT, UPDATE, and DELETE operations on all tables
-- =====================================================

-- Drop existing policies for admins table
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Admins can insert admins" ON admins;
DROP POLICY IF EXISTS "Admins can update admins" ON admins;
DROP POLICY IF EXISTS "Admins can delete admins" ON admins;

-- Create comprehensive policies for admins table
CREATE POLICY "Admins can view all admins" ON admins
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert admins" ON admins
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update admins" ON admins
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete admins" ON admins
  FOR DELETE USING (true);

-- Drop existing policies for events table
DROP POLICY IF EXISTS "Admins can view all events" ON events;
DROP POLICY IF EXISTS "Admins can insert events" ON events;
DROP POLICY IF EXISTS "Admins can update events" ON events;
DROP POLICY IF EXISTS "Admins can delete events" ON events;

-- Create comprehensive policies for events table
CREATE POLICY "Admins can view all events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update events" ON events
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete events" ON events
  FOR DELETE USING (true);

-- Drop existing policies for admin_events table
DROP POLICY IF EXISTS "Admins can view admin_events" ON admin_events;
DROP POLICY IF EXISTS "Admins can insert admin_events" ON admin_events;
DROP POLICY IF EXISTS "Admins can update admin_events" ON admin_events;
DROP POLICY IF EXISTS "Admins can delete admin_events" ON admin_events;

-- Create comprehensive policies for admin_events table
CREATE POLICY "Admins can view admin_events" ON admin_events
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert admin_events" ON admin_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update admin_events" ON admin_events
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete admin_events" ON admin_events
  FOR DELETE USING (true);

-- =====================================================
-- FIX COMPLETE!
-- =====================================================
-- Now you should be able to insert, update, and delete rows
-- =====================================================


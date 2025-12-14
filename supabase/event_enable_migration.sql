-- =====================================================
-- Add is_enabled column to events table
-- =====================================================
-- This migration adds an is_enabled flag to control event visibility
-- Only super admins can see disabled events
-- =====================================================

-- Add is_enabled column with default value of true
ALTER TABLE events
ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT true NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_is_enabled ON events(is_enabled);

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- Run this migration to add the is_enabled feature
-- =====================================================

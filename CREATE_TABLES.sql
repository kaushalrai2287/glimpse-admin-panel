-- =====================================================
-- GLIMPSE EVENT MANAGEMENT SYSTEM - DATABASE SETUP
-- =====================================================
-- Run this script in Supabase SQL Editor to create all tables
-- Make sure to run this BEFORE creating any admins
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Create admins table
-- =====================================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'event_admin' CHECK (role IN ('super_admin', 'event_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Create events table
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  login_code VARCHAR(50) UNIQUE NOT NULL,
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Create admin_events junction table
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(admin_id, event_id)
);

-- =====================================================
-- Create indexes for better performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_events_event_id ON events(event_id);
CREATE INDEX IF NOT EXISTS idx_events_login_code ON events(login_code);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_admin_events_admin_id ON admin_events(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_events_event_id ON admin_events(event_id);

-- =====================================================
-- Function to update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- Triggers to update updated_at automatically
-- =====================================================
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Enable Row Level Security (RLS)
-- =====================================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies (allows all operations - adjust for production)
-- =====================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Admins can insert admins" ON admins;
DROP POLICY IF EXISTS "Admins can update admins" ON admins;
DROP POLICY IF EXISTS "Admins can delete admins" ON admins;

DROP POLICY IF EXISTS "Admins can view all events" ON events;
DROP POLICY IF EXISTS "Admins can insert events" ON events;
DROP POLICY IF EXISTS "Admins can update events" ON events;
DROP POLICY IF EXISTS "Admins can delete events" ON events;

DROP POLICY IF EXISTS "Admins can view admin_events" ON admin_events;
DROP POLICY IF EXISTS "Admins can insert admin_events" ON admin_events;
DROP POLICY IF EXISTS "Admins can update admin_events" ON admin_events;
DROP POLICY IF EXISTS "Admins can delete admin_events" ON admin_events;

-- Policies for admins table
CREATE POLICY "Admins can view all admins" ON admins
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert admins" ON admins
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update admins" ON admins
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete admins" ON admins
  FOR DELETE USING (true);

-- Policies for events table
CREATE POLICY "Admins can view all events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update events" ON events
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete events" ON events
  FOR DELETE USING (true);

-- Policies for admin_events table
CREATE POLICY "Admins can view admin_events" ON admin_events
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert admin_events" ON admin_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update admin_events" ON admin_events
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete admin_events" ON admin_events
  FOR DELETE USING (true);

-- =====================================================
-- VERIFICATION QUERIES (Optional - run these to verify)
-- =====================================================
-- Uncomment the following lines to verify tables were created:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('admins', 'events', 'admin_events');

-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'admins';

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Verify tables in Supabase Table Editor
-- 2. Set up .env.local with Supabase credentials
-- 3. Run: npm run dev
-- 4. Navigate to /setup to create first super admin
-- =====================================================


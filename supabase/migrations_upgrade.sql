-- =====================================================
-- UPGRADE MIGRATION - Add missing columns to existing tables
-- =====================================================
-- Run this script if you have existing tables and need to add new columns
-- This adds the new fields to events table and creates new tables
-- =====================================================

-- Add new columns to existing events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES event_categories(id),
ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id),
ADD COLUMN IF NOT EXISTS splash_image_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS background_banner_image_url TEXT,
ADD COLUMN IF NOT EXISTS banner_text_color VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS welcome_text TEXT;

-- Create new tables (these are safe to run even if tables exist)
CREATE TABLE IF NOT EXISTS event_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  bg_image_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  city VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  phone_number VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pre_event_explore (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pre_event_happening (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS during_event_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  content TEXT,
  media_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_event_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  content TEXT,
  media_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_events_category_id ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_facilities_venue_id ON venue_facilities(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_contacts_venue_id ON venue_contacts(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_photos_venue_id ON venue_photos(venue_id);
CREATE INDEX IF NOT EXISTS idx_pre_event_explore_event_id ON pre_event_explore(event_id);
CREATE INDEX IF NOT EXISTS idx_pre_event_happening_event_id ON pre_event_happening(event_id);
CREATE INDEX IF NOT EXISTS idx_during_event_content_event_id ON during_event_content(event_id);
CREATE INDEX IF NOT EXISTS idx_post_event_content_event_id ON post_event_content(event_id);

-- Add triggers for new tables
DROP TRIGGER IF EXISTS update_event_categories_updated_at ON event_categories;
CREATE TRIGGER update_event_categories_updated_at BEFORE UPDATE ON event_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_during_event_content_updated_at ON during_event_content;
CREATE TRIGGER update_during_event_content_updated_at BEFORE UPDATE ON during_event_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for new tables
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_event_explore ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_event_happening ENABLE ROW LEVEL SECURITY;
ALTER TABLE during_event_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_event_content ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for new tables (using DROP IF EXISTS for safety)
DROP POLICY IF EXISTS "Admins can view event_categories" ON event_categories;
DROP POLICY IF EXISTS "Admins can insert event_categories" ON event_categories;
DROP POLICY IF EXISTS "Admins can update event_categories" ON event_categories;
DROP POLICY IF EXISTS "Admins can delete event_categories" ON event_categories;

DROP POLICY IF EXISTS "Admins can view venues" ON venues;
DROP POLICY IF EXISTS "Admins can insert venues" ON venues;
DROP POLICY IF EXISTS "Admins can update venues" ON venues;
DROP POLICY IF EXISTS "Admins can delete venues" ON venues;

DROP POLICY IF EXISTS "Admins can view venue_facilities" ON venue_facilities;
DROP POLICY IF EXISTS "Admins can insert venue_facilities" ON venue_facilities;
DROP POLICY IF EXISTS "Admins can update venue_facilities" ON venue_facilities;
DROP POLICY IF EXISTS "Admins can delete venue_facilities" ON venue_facilities;

DROP POLICY IF EXISTS "Admins can view venue_contacts" ON venue_contacts;
DROP POLICY IF EXISTS "Admins can insert venue_contacts" ON venue_contacts;
DROP POLICY IF EXISTS "Admins can update venue_contacts" ON venue_contacts;
DROP POLICY IF EXISTS "Admins can delete venue_contacts" ON venue_contacts;

DROP POLICY IF EXISTS "Admins can view venue_photos" ON venue_photos;
DROP POLICY IF EXISTS "Admins can insert venue_photos" ON venue_photos;
DROP POLICY IF EXISTS "Admins can update venue_photos" ON venue_photos;
DROP POLICY IF EXISTS "Admins can delete venue_photos" ON venue_photos;

DROP POLICY IF EXISTS "Admins can view pre_event_explore" ON pre_event_explore;
DROP POLICY IF EXISTS "Admins can insert pre_event_explore" ON pre_event_explore;
DROP POLICY IF EXISTS "Admins can update pre_event_explore" ON pre_event_explore;
DROP POLICY IF EXISTS "Admins can delete pre_event_explore" ON pre_event_explore;

DROP POLICY IF EXISTS "Admins can view pre_event_happening" ON pre_event_happening;
DROP POLICY IF EXISTS "Admins can insert pre_event_happening" ON pre_event_happening;
DROP POLICY IF EXISTS "Admins can update pre_event_happening" ON pre_event_happening;
DROP POLICY IF EXISTS "Admins can delete pre_event_happening" ON pre_event_happening;

DROP POLICY IF EXISTS "Admins can view during_event_content" ON during_event_content;
DROP POLICY IF EXISTS "Admins can insert during_event_content" ON during_event_content;
DROP POLICY IF EXISTS "Admins can update during_event_content" ON during_event_content;
DROP POLICY IF EXISTS "Admins can delete during_event_content" ON during_event_content;

DROP POLICY IF EXISTS "Admins can view post_event_content" ON post_event_content;
DROP POLICY IF EXISTS "Admins can insert post_event_content" ON post_event_content;
DROP POLICY IF EXISTS "Admins can update post_event_content" ON post_event_content;
DROP POLICY IF EXISTS "Admins can delete post_event_content" ON post_event_content;

CREATE POLICY "Admins can view event_categories" ON event_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert event_categories" ON event_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update event_categories" ON event_categories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete event_categories" ON event_categories FOR DELETE USING (true);

CREATE POLICY "Admins can view venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Admins can insert venues" ON venues FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update venues" ON venues FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete venues" ON venues FOR DELETE USING (true);

CREATE POLICY "Admins can view venue_facilities" ON venue_facilities FOR SELECT USING (true);
CREATE POLICY "Admins can insert venue_facilities" ON venue_facilities FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update venue_facilities" ON venue_facilities FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete venue_facilities" ON venue_facilities FOR DELETE USING (true);

CREATE POLICY "Admins can view venue_contacts" ON venue_contacts FOR SELECT USING (true);
CREATE POLICY "Admins can insert venue_contacts" ON venue_contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update venue_contacts" ON venue_contacts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete venue_contacts" ON venue_contacts FOR DELETE USING (true);

CREATE POLICY "Admins can view venue_photos" ON venue_photos FOR SELECT USING (true);
CREATE POLICY "Admins can insert venue_photos" ON venue_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update venue_photos" ON venue_photos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete venue_photos" ON venue_photos FOR DELETE USING (true);

CREATE POLICY "Admins can view pre_event_explore" ON pre_event_explore FOR SELECT USING (true);
CREATE POLICY "Admins can insert pre_event_explore" ON pre_event_explore FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update pre_event_explore" ON pre_event_explore FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete pre_event_explore" ON pre_event_explore FOR DELETE USING (true);

CREATE POLICY "Admins can view pre_event_happening" ON pre_event_happening FOR SELECT USING (true);
CREATE POLICY "Admins can insert pre_event_happening" ON pre_event_happening FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update pre_event_happening" ON pre_event_happening FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete pre_event_happening" ON pre_event_happening FOR DELETE USING (true);

CREATE POLICY "Admins can view during_event_content" ON during_event_content FOR SELECT USING (true);
CREATE POLICY "Admins can insert during_event_content" ON during_event_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update during_event_content" ON during_event_content FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete during_event_content" ON during_event_content FOR DELETE USING (true);

CREATE POLICY "Admins can view post_event_content" ON post_event_content FOR SELECT USING (true);
CREATE POLICY "Admins can insert post_event_content" ON post_event_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update post_event_content" ON post_event_content FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete post_event_content" ON post_event_content FOR DELETE USING (true);

-- =====================================================
-- UPGRADE COMPLETE!
-- =====================================================
-- Now run the original migrations.sql if you haven't already
-- Or just use this upgrade script for existing databases
-- =====================================================
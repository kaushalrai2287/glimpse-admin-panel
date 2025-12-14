-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create event_categories table
CREATE TABLE IF NOT EXISTS event_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create venues table
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

-- Create venue_facilities table
CREATE TABLE IF NOT EXISTS venue_facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create venue_contacts table (SPOC - Single Point of Contact)
CREATE TABLE IF NOT EXISTS venue_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  phone_number VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create venue_photos table
CREATE TABLE IF NOT EXISTS venue_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'event_admin' CHECK (role IN ('super_admin', 'event_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES event_categories(id),
  venue_id UUID REFERENCES venues(id),
  login_code VARCHAR(50) UNIQUE NOT NULL,
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  -- Event styling
  splash_image_url TEXT,
  primary_color VARCHAR(7), -- Hex color code
  secondary_color VARCHAR(7), -- Hex color code
  -- Pre-event content
  background_banner_image_url TEXT,
  banner_text_color VARCHAR(7),
  welcome_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_events junction table
CREATE TABLE IF NOT EXISTS admin_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(admin_id, event_id)
);

-- Create pre_event_explore table
CREATE TABLE IF NOT EXISTS pre_event_explore (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pre_event_happening table
CREATE TABLE IF NOT EXISTS pre_event_happening (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create during_event_content table (placeholder for future implementation)
CREATE TABLE IF NOT EXISTS during_event_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL, -- 'announcement', 'update', 'schedule', etc.
  title VARCHAR(255),
  content TEXT,
  media_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_event_content table (placeholder for future implementation)
CREATE TABLE IF NOT EXISTS post_event_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL, -- 'photo', 'video', 'testimonial', 'summary'
  title VARCHAR(255),
  content TEXT,
  media_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_events_event_id ON events(event_id);
CREATE INDEX IF NOT EXISTS idx_events_login_code ON events(login_code);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_category_id ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_admin_events_admin_id ON admin_events(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_events_event_id ON admin_events(event_id);
CREATE INDEX IF NOT EXISTS idx_venue_facilities_venue_id ON venue_facilities(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_contacts_venue_id ON venue_contacts(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_photos_venue_id ON venue_photos(venue_id);
CREATE INDEX IF NOT EXISTS idx_pre_event_explore_event_id ON pre_event_explore(event_id);
CREATE INDEX IF NOT EXISTS idx_pre_event_happening_event_id ON pre_event_happening(event_id);
CREATE INDEX IF NOT EXISTS idx_during_event_content_event_id ON during_event_content(event_id);
CREATE INDEX IF NOT EXISTS idx_post_event_content_event_id ON post_event_content(event_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to update updated_at
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_categories_updated_at ON event_categories;
CREATE TRIGGER update_event_categories_updated_at BEFORE UPDATE ON event_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_during_event_content_updated_at ON during_event_content;
CREATE TRIGGER update_during_event_content_updated_at BEFORE UPDATE ON during_event_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_event_explore ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_event_happening ENABLE ROW LEVEL SECURITY;
ALTER TABLE during_event_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_event_content ENABLE ROW LEVEL SECURITY;

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

-- Additional policies for new tables
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

-- Policies for event_categories table
CREATE POLICY "Admins can view event_categories" ON event_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert event_categories" ON event_categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update event_categories" ON event_categories
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete event_categories" ON event_categories
  FOR DELETE USING (true);

-- Policies for venues table
CREATE POLICY "Admins can view venues" ON venues
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert venues" ON venues
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update venues" ON venues
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete venues" ON venues
  FOR DELETE USING (true);

-- Policies for venue_facilities table
CREATE POLICY "Admins can view venue_facilities" ON venue_facilities
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert venue_facilities" ON venue_facilities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update venue_facilities" ON venue_facilities
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete venue_facilities" ON venue_facilities
  FOR DELETE USING (true);

-- Policies for venue_contacts table
CREATE POLICY "Admins can view venue_contacts" ON venue_contacts
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert venue_contacts" ON venue_contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update venue_contacts" ON venue_contacts
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete venue_contacts" ON venue_contacts
  FOR DELETE USING (true);

-- Policies for venue_photos table
CREATE POLICY "Admins can view venue_photos" ON venue_photos
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert venue_photos" ON venue_photos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update venue_photos" ON venue_photos
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete venue_photos" ON venue_photos
  FOR DELETE USING (true);

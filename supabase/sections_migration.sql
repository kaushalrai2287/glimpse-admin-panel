-- Add columns for During Event (Section C)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS during_background_banner_image_url TEXT,
ADD COLUMN IF NOT EXISTS during_banner_text_color VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS during_welcome_text TEXT;

-- Add columns for Post Event (Section D)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS post_background_banner_image_url TEXT,
ADD COLUMN IF NOT EXISTS post_banner_text_color VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS post_welcome_text TEXT;

-- Create table for Event Sessions (Section C - Today's session)
CREATE TABLE IF NOT EXISTS event_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  venue_name VARCHAR(255),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for Event Days (Section D - List of total days)
CREATE TABLE IF NOT EXISTS event_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  image_url TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_event_sessions_event_id ON event_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_days_event_id ON event_days(event_id);

-- Enable RLS
ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_days ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (matching existing pattern)
CREATE POLICY "Admins can view event_sessions" ON event_sessions FOR SELECT USING (true);
CREATE POLICY "Admins can insert event_sessions" ON event_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update event_sessions" ON event_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete event_sessions" ON event_sessions FOR DELETE USING (true);

CREATE POLICY "Admins can view event_days" ON event_days FOR SELECT USING (true);
CREATE POLICY "Admins can insert event_days" ON event_days FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update event_days" ON event_days FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete event_days" ON event_days FOR DELETE USING (true);

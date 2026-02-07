-- Create event_intro table for intro section items
CREATE TABLE IF NOT EXISTS event_intro (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_event_intro_event_id ON event_intro(event_id);
CREATE INDEX IF NOT EXISTS idx_event_intro_sort_order ON event_intro(sort_order);

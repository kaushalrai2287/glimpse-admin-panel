-- Create app_profile_settings table for storing app profile settings
-- This table stores global app settings that apply to all events
CREATE TABLE IF NOT EXISTS app_profile_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_image_url TEXT,
  about_us_url TEXT,
  privacy_policy_url TEXT,
  terms_and_condition_url TEXT,
  insta_id VARCHAR(255),
  app_version VARCHAR(50) DEFAULT '1.0.0',
  app_version_detail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default profile settings (only if table is empty)
INSERT INTO app_profile_settings (id, user_image_url, about_us_url, privacy_policy_url, terms_and_condition_url, insta_id, app_version, app_version_detail)
SELECT 
  uuid_generate_v4(),
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '1.0.0',
  'Initial version'
WHERE NOT EXISTS (SELECT 1 FROM app_profile_settings);

-- Create index
CREATE INDEX IF NOT EXISTS idx_app_profile_settings_id ON app_profile_settings(id);

-- Enable RLS
ALTER TABLE app_profile_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (app will handle authentication)
CREATE POLICY "Allow all operations on app_profile_settings" ON app_profile_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_app_profile_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_app_profile_settings_updated_at ON app_profile_settings;
CREATE TRIGGER update_app_profile_settings_updated_at BEFORE UPDATE ON app_profile_settings
  FOR EACH ROW EXECUTE FUNCTION update_app_profile_settings_updated_at();

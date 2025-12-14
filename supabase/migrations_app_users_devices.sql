-- Create app_users table for storing app user information
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  country_code VARCHAR(10) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  username VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, country_code, phone_number)
);

-- Create app_devices table for storing device information
CREATE TABLE IF NOT EXISTS app_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('ios', 'android', 'web')),
  fcm_token TEXT,
  platform VARCHAR(50),
  app_version VARCHAR(50),
  device_version VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id, device_type, fcm_token)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_users_event_phone ON app_users(event_id, country_code, phone_number);
CREATE INDEX IF NOT EXISTS idx_app_devices_user_id ON app_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_app_devices_event_id ON app_devices(event_id);
CREATE INDEX IF NOT EXISTS idx_app_devices_fcm_token ON app_devices(fcm_token);

-- Enable RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_devices ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations (app will handle authentication via OTP)
CREATE POLICY "Allow all operations on app_users" ON app_users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on app_devices" ON app_devices
  FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_app_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_app_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to update updated_at
DROP TRIGGER IF EXISTS update_app_users_updated_at ON app_users;
CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE ON app_users
  FOR EACH ROW EXECUTE FUNCTION update_app_users_updated_at();

DROP TRIGGER IF EXISTS update_app_devices_updated_at ON app_devices;
CREATE TRIGGER update_app_devices_updated_at BEFORE UPDATE ON app_devices
  FOR EACH ROW EXECUTE FUNCTION update_app_devices_updated_at();

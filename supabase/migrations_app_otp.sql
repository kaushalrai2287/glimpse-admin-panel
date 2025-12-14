-- Create app_otps table for storing OTPs for app login
CREATE TABLE IF NOT EXISTS app_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  country_code VARCHAR(10) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  username VARCHAR(255),
  otp VARCHAR(4) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, phone_number, country_code)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_otps_event_phone ON app_otps(event_id, country_code, phone_number);
CREATE INDEX IF NOT EXISTS idx_app_otps_otp ON app_otps(otp);
CREATE INDEX IF NOT EXISTS idx_app_otps_expires_at ON app_otps(expires_at);

-- Enable RLS
ALTER TABLE app_otps ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (app will handle authentication via OTP)
CREATE POLICY "Allow all operations on app_otps" ON app_otps
  FOR ALL USING (true) WITH CHECK (true);

-- Add profile fields to app_users table
ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS insta_id VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_users_profile_image ON app_users(profile_image_url) WHERE profile_image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_app_users_insta_id ON app_users(insta_id) WHERE insta_id IS NOT NULL;

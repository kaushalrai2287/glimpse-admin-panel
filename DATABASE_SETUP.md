# Database Setup Guide

## Step-by-Step Instructions to Create Tables in Supabase

### Step 1: Access Supabase SQL Editor

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Login to your account
3. Select your project (or create a new one if you haven't already)
4. In the left sidebar, click on **SQL Editor**
5. Click on **New Query**

### Step 2: Copy and Run the Migration SQL

1. Open the file `supabase/migrations.sql` from this project
2. Copy the entire contents of the file
3. Paste it into the SQL Editor in Supabase
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### Step 3: Verify Tables Are Created

1. In the left sidebar, click on **Table Editor**
2. You should see three new tables:
   - `admins`
   - `events`
   - `admin_events`

### Step 4: Verify Table Structure

Click on each table to verify the columns:

#### `admins` table should have:
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password_hash` (TEXT)
- `name` (VARCHAR)
- `role` (VARCHAR: 'super_admin' or 'event_admin')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `events` table should have:
- `id` (UUID, Primary Key)
- `event_id` (VARCHAR, Unique)
- `name` (VARCHAR)
- `description` (TEXT)
- `login_code` (VARCHAR, Unique)
- `created_by` (UUID, Foreign Key)
- `start_date` (TIMESTAMP)
- `end_date` (TIMESTAMP)
- `status` (VARCHAR: 'active', 'inactive', 'completed')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `admin_events` table should have:
- `id` (UUID, Primary Key)
- `admin_id` (UUID, Foreign Key)
- `event_id` (UUID, Foreign Key)
- `created_at` (TIMESTAMP)

## Complete SQL Script

Here's the complete SQL script you need to run:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  login_code VARCHAR(50) UNIQUE NOT NULL,
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_events_event_id ON events(event_id);
CREATE INDEX IF NOT EXISTS idx_events_login_code ON events(login_code);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_admin_events_admin_id ON admin_events(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_events_event_id ON admin_events(event_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to update updated_at
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - you may want to adjust these based on your auth setup)
-- For admins table
CREATE POLICY "Admins can view all admins" ON admins
  FOR SELECT USING (true);

-- For events table
CREATE POLICY "Admins can view all events" ON events
  FOR SELECT USING (true);

-- For admin_events table
CREATE POLICY "Admins can view admin_events" ON admin_events
  FOR SELECT USING (true);
```

## Troubleshooting

### Error: "extension uuid-ossp does not exist"

This usually means the extension isn't enabled. The SQL script includes `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` which should handle this. If you still get an error:

1. Go to Database → Extensions in Supabase
2. Search for "uuid-ossp"
3. Enable it if it's not already enabled

### Error: "relation already exists"

If you see this error, it means the tables already exist. You can either:
1. Drop the existing tables and recreate them (⚠️ **WARNING**: This will delete all data)
2. Skip creating the tables that already exist

To drop and recreate (⚠️ **DANGER**: Deletes all data):
```sql
DROP TABLE IF EXISTS admin_events CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
```

Then run the migration script again.

### Error: "permission denied"

Make sure you're logged in as the project owner or have the necessary permissions to create tables.

### Tables created but RLS policies not working

The RLS policies in the script are basic and allow all SELECT operations. For production, you may want to restrict these based on authentication. The current setup works for development but should be reviewed for production use.

## Next Steps

After creating the tables:

1. ✅ Verify tables are created in Table Editor
2. ✅ Set up your `.env.local` file with Supabase credentials
3. ✅ Run the development server: `npm run dev`
4. ✅ Create your first super admin at `/setup`

## Visual Guide

### Step 1: Open SQL Editor
```
Supabase Dashboard → SQL Editor (left sidebar) → New Query
```

### Step 2: Paste SQL
```
Copy entire content from supabase/migrations.sql
Paste into SQL Editor
Click "Run" button
```

### Step 3: Verify
```
Table Editor (left sidebar) → See three tables:
- admins
- events  
- admin_events
```

## Quick Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Copied migration SQL script
- [ ] Pasted and ran SQL in Supabase
- [ ] Verified tables are created in Table Editor
- [ ] Verified table structure (columns exist)
- [ ] Checked for any errors in SQL Editor
- [ ] Ready to create first admin

## Need Help?

If you encounter any issues:
1. Check the error message in Supabase SQL Editor
2. Verify your Supabase project is active
3. Make sure you have the necessary permissions
4. Check that the UUID extension is enabled
5. Review the troubleshooting section above


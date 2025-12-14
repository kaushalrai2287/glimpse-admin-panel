# Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- npm or yarn package manager

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be set up
3. Go to Project Settings > API
4. Copy your Project URL and anon/public key

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in the root directory
2. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Step 4: Set Up Database ⚠️ **IMPORTANT: DO THIS FIRST**

**Before creating admins or running the app, you must create the database tables.**

### Quick Steps:

1. **Go to your Supabase project dashboard**
   - Navigate to [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Open SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click on **New Query**

3. **Run the migration SQL**
   - Open the file `supabase/migrations.sql` from this project
   - Copy the entire contents
   - Paste it into the SQL Editor
   - Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

4. **Verify tables are created**
   - Click on **Table Editor** in the left sidebar
   - You should see three tables:
     - `admins` - Admin users
     - `events` - Events
     - `admin_events` - Junction table for admin-event assignments

### Detailed Instructions:

See `DATABASE_SETUP.md` for step-by-step instructions with screenshots and troubleshooting.

### What Gets Created:

- **`admins` table**: Stores admin users with roles
- **`events` table**: Stores event information
- **`admin_events` table**: Links admins to events (many-to-many relationship)
- **Indexes**: For better query performance
- **Triggers**: Auto-update `updated_at` timestamps
- **RLS Policies**: Basic row-level security policies

### ⚠️ Important Notes:

- Make sure to run the SQL script **before** creating any admins
- The script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times
- If tables already exist, the script won't overwrite them
- All tables are empty initially - you'll add data after setup

## Step 5: Create Your First Super Admin

### Option 1: Using the Web Setup Page (Recommended)

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
   - You'll be automatically redirected to `/setup` if no admins exist

3. Fill in the super admin details:
   - Name
   - Email
   - Password (minimum 6 characters)
   - Confirm Password

4. Click "Create Super Admin"
   - You'll be redirected to the login page
   - Login with your super admin credentials

### Option 2: Using the Setup Script

Run the provided script to create your first admin:

```bash
node scripts/create-first-admin.js
```

The script will prompt you for:
- Email
- Password
- Name
- Role (super_admin or event_admin)

This script will automatically hash your password and create the admin in your Supabase database.

### Option 3: Using Supabase SQL Editor

If you prefer to use SQL directly:

1. First, hash your password using Node.js or an online bcrypt generator
2. Run this SQL in the Supabase SQL Editor:

```sql
INSERT INTO admins (email, password_hash, name, role)
VALUES (
  'admin@example.com',
  '$2a$10$YourHashedPasswordHere', -- Replace with actual bcrypt hash
  'Super Admin',
  'super_admin'
);
```

To hash a password using Node.js:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('yourpassword', 10).then(console.log);
```

## Step 6: Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Step 7: Login

1. Navigate to `http://localhost:3000/login`
2. Use your super admin credentials
3. You should be redirected to the dashboard

## Creating Additional Admins

### As Super Admin:

1. Login as super admin
2. You can create admins through the API (create an admin creation UI if needed)
3. Or use the Supabase dashboard to create admins manually

### Using API:

```bash
curl -X POST http://localhost:3000/api/admins/create \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_id=your_admin_id" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "name": "Event Admin",
    "role": "event_admin"
  }'
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── login/             # Login page
├── components/            # React components
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication functions
│   ├── events.ts         # Event management functions
│   └── supabase/         # Supabase client configuration
├── supabase/             # Database migrations
└── public/               # Static files
```

## Features

- ✅ Admin authentication
- ✅ Role-based access control (Super Admin / Event Admin)
- ✅ Event creation (Super Admin only)
- ✅ Event access management
- ✅ Event ID and login code generation
- ✅ Admin assignment to events
- ✅ Event listing with access control

## Troubleshooting

### Issue: "Missing env.NEXT_PUBLIC_SUPABASE_URL"

- Make sure you have created `.env.local` file
- Restart the development server after creating the file

### Issue: "Not authenticated" errors

- Make sure you're logged in
- Check if cookies are enabled in your browser
- Clear browser cookies and try logging in again

### Issue: Database connection errors

- Verify your Supabase URL and API key
- Check if your Supabase project is active
- Make sure you've run the migration SQL

## Next Steps

1. Customize the UI styling
2. Add more event management features
3. Implement event editing
4. Add event deletion
5. Create user-facing event pages
6. Add event registration functionality


# Quick Start Guide

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create `.env.local` file:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Create database tables (IMPORTANT - Do this first!):**
   - Go to Supabase Dashboard → SQL Editor
   - Copy and run the SQL from `supabase/migrations.sql` or `CREATE_TABLES.sql`
   - Verify tables are created in Table Editor
   - See `DATABASE_SETUP.md` for detailed step-by-step instructions

4. **Create your first admin:**
   ```bash
   node scripts/create-first-admin.js
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Login:**
   - Navigate to `http://localhost:3000/login`
   - Use your admin credentials

## Features Overview

### Admin Roles

- **Super Admin:**
  - Can create events
  - Can access all events
  - Can assign admins to events
  - Can remove admins from events
  - Can view all admins

- **Event Admin:**
  - Can only access assigned events
  - Can view event details
  - Cannot create events
  - Cannot assign admins

### Event Management

- **Create Event (Super Admin only):**
  - Event name (required)
  - Description (optional)
  - Start date (optional)
  - End date (optional)
  - Login code (auto-generated if not provided)
  - Assign admins to event

- **Event Details:**
  - Event ID (auto-generated)
  - Login code (auto-generated or manual)
  - Assigned admins
  - Event status
  - Creation date

### Access Control

- Super admins can access all events
- Event admins can only access events assigned to them
- Access is automatically enforced at the API level
- Unauthorized access attempts return 403 Forbidden

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current admin

### Events
- `GET /api/events` - Get events (filtered by admin role)
- `POST /api/events` - Create event (Super Admin only)
- `GET /api/events/[id]` - Get event details
- `POST /api/events/[id]/assign` - Assign admin to event (Super Admin only)
- `DELETE /api/events/[id]/assign` - Remove admin from event (Super Admin only)

### Admins
- `GET /api/admins` - Get all admins (Super Admin only)
- `POST /api/admins/create` - Create admin (Super Admin only)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication routes
│   │   ├── events/        # Event routes
│   │   └── admins/        # Admin routes
│   ├── dashboard/         # Dashboard pages
│   │   └── events/        # Event pages
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── DashboardLayout.tsx
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication functions
│   ├── events.ts         # Event management functions
│   ├── types.ts          # TypeScript types
│   └── supabase/         # Supabase client configuration
├── supabase/             # Database migrations
│   └── migrations.sql
└── scripts/              # Utility scripts
    └── create-first-admin.js
```

## Database Schema

### admins
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password_hash` (TEXT)
- `name` (VARCHAR)
- `role` (VARCHAR: 'super_admin' or 'event_admin')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### events
- `id` (UUID, Primary Key)
- `event_id` (VARCHAR, Unique)
- `name` (VARCHAR)
- `description` (TEXT)
- `login_code` (VARCHAR, Unique)
- `created_by` (UUID, Foreign Key to admins)
- `start_date` (TIMESTAMP)
- `end_date` (TIMESTAMP)
- `status` (VARCHAR: 'active', 'inactive', 'completed')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### admin_events
- `id` (UUID, Primary Key)
- `admin_id` (UUID, Foreign Key to admins)
- `event_id` (UUID, Foreign Key to events)
- `created_at` (TIMESTAMP)

## Common Tasks

### Create a New Admin (as Super Admin)

1. Login as super admin
2. Use the API endpoint:
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

### Create an Event (as Super Admin)

1. Login as super admin
2. Navigate to Dashboard > Create Event
3. Fill in the event details
4. Select admins to assign
5. Click "Create Event"

### Assign Admin to Event (as Super Admin)

1. Login as super admin
2. Navigate to event details page
3. Select an admin from the dropdown
4. The admin will be assigned automatically

## Troubleshooting

### Issue: "Missing env.NEXT_PUBLIC_SUPABASE_URL"
- Make sure `.env.local` file exists
- Restart the development server

### Issue: "Not authenticated"
- Make sure you're logged in
- Check if cookies are enabled
- Clear browser cookies and login again

### Issue: "Access denied"
- Check if you have the required role
- For event admins, make sure you're assigned to the event
- Only super admins can create events and assign admins

### Issue: Database connection errors
- Verify your Supabase URL and API key
- Check if your Supabase project is active
- Make sure you've run the migration SQL

## Next Steps

- Customize the UI styling
- Add more event management features
- Implement event editing
- Add event deletion
- Create user-facing event pages
- Add event registration functionality
- Add email notifications
- Add event analytics


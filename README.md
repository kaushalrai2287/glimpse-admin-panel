# Glimpse Admin Panel

A modern, feature-rich admin panel for managing events, venues, categories, and administrators. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🎯 **Event Management**: Create, edit, and manage events with comprehensive details
- 🏢 **Venue Management**: Manage venues with facilities, contacts, and photos
- 📂 **Category Management**: Organize events with categories
- 👥 **Admin Management**: Role-based access control (Super Admin & Event Admin)
- 🎨 **Modern UI**: Beautiful purple-themed interface (#5550B7)
- 🔐 **Secure Authentication**: Cookie-based session management
- 📱 **Responsive Design**: Works seamlessly on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Cookie-based sessions with bcryptjs
- **UI Components**: Custom components with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd glimpse-admin-panel
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Run database migrations:
Execute the SQL migrations in `supabase/migrations.sql` in your Supabase SQL editor.

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Time Setup

1. Navigate to `/setup` to create your first super admin account.
2. Login with your super admin credentials.
3. Start creating events, venues, and categories!

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   └── setup/             # Setup page
├── components/            # React components
├── lib/                   # Utility functions and database helpers
├── supabase/              # Supabase configuration and migrations
└── app/                   # Global styles and configuration
```

## Role-Based Access Control

### Super Admin
- Create and delete events
- Enable/disable events
- Create and manage admins
- Assign/remove admins from events
- Full access to all features

### Event Admin
- Edit existing events
- Create and manage categories
- Create and manage venues
- View assigned admins (read-only)
- Cannot create events, delete events, or manage admins

## Features Overview

### Event Management
- Multi-step event creation form
- Pre-event, during-event, and post-event configurations
- Explore items and happening items
- Event sessions and days
- Custom color themes
- Banner images and welcome text

### Venue Management
- Venue details with address and coordinates
- Facilities management
- Contact information
- Photo galleries

### Category Management
- Create and manage event categories
- Category descriptions

## Styling

The admin panel uses a custom purple theme (#5550B7) with white accents. Custom styles are defined in `app/admin-panel.css` using Tailwind's `@apply` directives.

## Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:
- `admins` - Admin users
- `events` - Event information
- `venues` - Venue details
- `categories` - Event categories
- `admin_events` - Admin-event assignments
- `pre_event_explore` - Pre-event explore items
- `pre_event_happening` - Pre-event happening items
- `event_sessions` - Event sessions
- `event_days` - Event days

## API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/events/*` - Event management
- `/api/venues/*` - Venue management
- `/api/categories/*` - Category management
- `/api/admins/*` - Admin management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support, please contact the development team.

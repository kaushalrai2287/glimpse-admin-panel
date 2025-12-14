# Environment Variables Setup Guide

## What to Put in .env.local File

Create a file named `.env.local` in the root directory of your project with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## How to Get These Values from Supabase

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Project Name
   - Database Password (save this!)
   - Region (choose closest to you)
5. Click "Create new project"
6. Wait for the project to be set up (takes a few minutes)

### Step 2: Get Your Project URL and API Key

1. Once your project is ready, go to **Project Settings** (gear icon in the left sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:

   **a) Project URL:**
   - Found under "Project URL"
   - Example: `https://abcdefghijklmnop.supabase.co`
   - Copy this value

   **b) Anon/Public Key:**
   - Found under "Project API keys"
   - Look for the **`anon` `public`** key (this is safe to use in client-side code)
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ...`
   - Copy this value

### Step 3: Create .env.local File

1. In your project root directory, create a file named `.env.local`
2. Add the following content (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ...
```

**Important:**
- Replace `https://abcdefghijklmnop.supabase.co` with your actual Supabase project URL
- Replace the long `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` with your actual anon key
- Do NOT include quotes around the values
- Do NOT commit this file to git (it's already in .gitignore)

### Step 4: Verify Your Setup

1. Make sure `.env.local` is in the root directory (same level as `package.json`)
2. Restart your development server after creating/updating `.env.local`
3. The app should now be able to connect to your Supabase database

## Example .env.local File

Here's what a complete `.env.local` file looks like with example values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.ABC123XYZ789...
```

## Troubleshooting

### Issue: "Missing env.NEXT_PUBLIC_SUPABASE_URL" error

**Solution:**
- Make sure the file is named exactly `.env.local` (not `.env` or `env.local`)
- Make sure the file is in the root directory of your project
- Restart your development server after creating the file
- Check that there are no extra spaces or quotes around the values

### Issue: "Invalid API key" error

**Solution:**
- Make sure you're using the **anon/public** key (not the service_role key)
- Verify you copied the entire key (they're very long)
- Check for any extra spaces or line breaks in the key
- Make sure there are no quotes around the key value

### Issue: Can't connect to Supabase

**Solution:**
- Verify your Supabase project is active and running
- Check that your project URL is correct
- Make sure you haven't exceeded Supabase free tier limits
- Verify your internet connection

## Security Notes

- ✅ The `anon` key is safe to use in client-side code (that's why it's prefixed with `NEXT_PUBLIC_`)
- ✅ Never commit `.env.local` to git (it's already in `.gitignore`)
- ⚠️ Never use the `service_role` key in client-side code
- ⚠️ Never share your `.env.local` file publicly

## Quick Reference

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Supabase Dashboard > Settings > API > Project API keys > anon public |


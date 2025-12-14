# Fix RLS Policy Error

## Problem

You're getting an error: **"new row violates row level security policy for table admin"**

This happens because Row Level Security (RLS) is enabled on the tables, but we only created SELECT policies. We need INSERT, UPDATE, and DELETE policies as well.

## Solution

Run the fix script to add the missing policies.

### Quick Fix (Recommended)

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Click on **SQL Editor** in the left sidebar
   - Click on **New Query**

2. **Run the fix script**
   - Open the file `supabase/fix-rls-policies.sql`
   - Copy the entire contents
   - Paste it into the SQL Editor
   - Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### Alternative: Run the Updated Migration

If you haven't created any data yet, you can:

1. Drop and recreate the tables with the updated migration script
2. Run the updated `supabase/migrations.sql` which now includes all policies

**⚠️ WARNING**: This will delete all existing data!

```sql
-- Drop tables (WARNING: Deletes all data!)
DROP TABLE IF EXISTS admin_events CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
```

Then run the updated `supabase/migrations.sql` script.

## What the Fix Does

The fix script adds the following policies to all tables:

### For `admins` table:
- ✅ SELECT (view) - allows reading all admins
- ✅ INSERT - allows creating new admins
- ✅ UPDATE - allows updating admins
- ✅ DELETE - allows deleting admins

### For `events` table:
- ✅ SELECT (view) - allows reading all events
- ✅ INSERT - allows creating new events
- ✅ UPDATE - allows updating events
- ✅ DELETE - allows deleting events

### For `admin_events` table:
- ✅ SELECT (view) - allows reading all admin-event relationships
- ✅ INSERT - allows creating new admin-event relationships
- ✅ UPDATE - allows updating admin-event relationships
- ✅ DELETE - allows deleting admin-event relationships

## Why This Happens

When Row Level Security (RLS) is enabled on a table, **all operations are blocked by default**. You must explicitly create policies for each operation type:

- **SELECT** - Reading data
- **INSERT** - Creating new rows
- **UPDATE** - Modifying existing rows
- **DELETE** - Removing rows

The original migration script only included SELECT policies, which is why you couldn't insert new rows.

## Security Note

The policies created by this fix allow **all operations for all users**. This is fine for development, but for production you may want to:

1. Add authentication checks to policies
2. Restrict operations based on user roles
3. Add more specific conditions to policies

For example, in production you might want:
- Only super admins can create admins
- Only super admins can delete events
- Event admins can only update their assigned events

## Verification

After running the fix, verify it works:

1. Try creating a super admin via the `/setup` page
2. Check if the admin was created in Supabase Table Editor
3. Try creating an event
4. Try assigning an admin to an event

If all operations work, the fix was successful!

## Troubleshooting

### Error: "policy already exists"

If you get this error, the policies might already exist. The fix script includes `DROP POLICY IF EXISTS` statements, so it should handle this automatically. If you still get errors:

1. Manually drop all policies first
2. Then run the fix script again

### Error: "permission denied"

Make sure you're logged in as the project owner or have the necessary permissions to modify RLS policies.

### Still getting RLS errors?

1. Verify RLS is enabled on the tables:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('admins', 'events', 'admin_events');
   ```

2. Check existing policies:
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'public' 
   AND tablename IN ('admins', 'events', 'admin_events');
   ```

3. Verify policies allow the operation you're trying:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'admins';
   ```

## Next Steps

After fixing the RLS policies:

1. ✅ Try creating your first super admin again
2. ✅ Verify the admin was created in Supabase
3. ✅ Login with your super admin credentials
4. ✅ Create additional admins and events

## Need More Help?

If you're still experiencing issues:

1. Check the Supabase logs for detailed error messages
2. Verify your `.env.local` file has the correct Supabase credentials
3. Make sure you're using the anon key (not the service_role key)
4. Check that your Supabase project is active and not paused


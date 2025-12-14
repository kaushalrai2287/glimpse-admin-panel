-- Check current values of is_enabled column
SELECT id, name, is_enabled FROM events;

-- If you see NULL or false values, run this to fix them:
UPDATE events 
SET is_enabled = true 
WHERE is_enabled IS NULL OR is_enabled IS DISTINCT FROM true;

-- Verify the fix
SELECT id, name, is_enabled FROM events;

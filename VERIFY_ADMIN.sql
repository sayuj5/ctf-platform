-- Check if users table has is_admin column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'is_admin';

-- Check your user's admin status
SELECT id, email, is_admin FROM users WHERE email = 'sayujsur05@gmail.com';

-- If user doesn't exist, you need to create them first
-- If the is_admin column doesn't exist, create it:
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set yourself as admin
UPDATE users SET is_admin = true WHERE email = 'sayujsur05@gmail.com';

-- Verify the update worked
SELECT id, email, is_admin FROM users WHERE email = 'sayujsur05@gmail.com';

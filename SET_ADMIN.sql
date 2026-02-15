-- Set sayujsur05@gmail.com as admin
UPDATE users SET is_admin = true WHERE email = 'sayujsur05@gmail.com';

-- Verify the change
SELECT id, email, is_admin FROM users WHERE email = 'sayujsur05@gmail.com';

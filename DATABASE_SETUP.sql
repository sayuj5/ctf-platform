-- CTF Platform Database Schema
-- Run these SQL commands in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extending Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Flags table
CREATE TABLE IF NOT EXISTS flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_name VARCHAR(255) NOT NULL,
  flag_value VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  points INTEGER DEFAULT 20,
  created_at TIMESTAMP DEFAULT now()
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flag_id UUID NOT NULL REFERENCES flags(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, flag_id)
);

-- Vulnerable machine downloads table
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_flag_id ON submissions(flag_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users - SIMPLIFIED
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

CREATE POLICY "Enable all for authenticated users" ON users
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for flags
DROP POLICY IF EXISTS "Flags are readable by authenticated users" ON flags;

CREATE POLICY "Flags are readable by authenticated users" ON flags
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for submissions - SIMPLIFIED
DROP POLICY IF EXISTS "Users can read their own submissions" ON submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON submissions;
DROP POLICY IF EXISTS "Admins and users can read submissions" ON submissions;

CREATE POLICY "Enable all for authenticated" ON submissions
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for downloads - SIMPLIFIED
DROP POLICY IF EXISTS "Users can read their own downloads" ON downloads;
DROP POLICY IF EXISTS "Users can insert their own downloads" ON downloads;

CREATE POLICY "Enable all for authenticated" ON downloads
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Insert sample flags (if they don't already exist)
INSERT INTO flags (flag_name, flag_value, description, points) VALUES
('Flag 1', 'a7x9k2m@#p5L$qR9wT3e4Y7u1i0o8s6d4f2g5h9j3k7l2m9n4p8q1r5t3v6w2z8c4x7y', 'Flag 1', 20),
('Flag 2', 'b3$q8n1w!z%jK^lM&nO*pQ(rS)tU-vW+xY=zAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEf', 'Flag 2', 20),
('Flag 3', 'd4c&r6t*v2#xYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzA', 'Flag 3', 20),
('Flag 4', 'e5f@g9h!k3$lM%nO^pQ&rS*tU(vW)xY-zA+bC=dEfGhIjKlMnOpQrStUvWxYzAbCdEf', 'Flag 4', 20),
('Flag 5', 'j8l2m^n5p@q$rS%tU^vW&xY*zA(bC)dE-fG+hI=jKlMnOpQrStUvWxYzAbCdEfGhIjK', 'Flag 5', 25)
ON CONFLICT (flag_value) DO NOTHING;

-- Fix RLS policy for user signup
-- Add missing INSERT policy for users table to allow signup

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Recreate user policies with proper INSERT permission
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Add INSERT policy to allow user creation during signup
-- This allows the handle_new_user() function to insert new users
CREATE POLICY "Enable user signup" ON users FOR INSERT WITH CHECK (true);

-- Alternative: If we want to be more restrictive, we could use:
-- CREATE POLICY "Enable user signup" ON users FOR INSERT WITH CHECK (auth.uid() = id);
-- But this might cause issues with the trigger function that runs during signup

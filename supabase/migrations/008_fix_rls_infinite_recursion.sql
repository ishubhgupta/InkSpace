-- Fix RLS Infinite Recursion Issue
-- This migration fixes the infinite recursion error in users table RLS policies
-- The issue was caused by policies that query the users table within their own USING clauses

-- Drop all conflicting policies on users table
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable user signup" ON users;
DROP POLICY IF EXISTS "admin_manage_users" ON users;

-- Create a simple, non-recursive policy structure for users
-- These policies do NOT query the users table within their USING clauses

-- 1. Allow all authenticated users to view all profiles (public information)
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (true);

-- 2. Allow users to update only their own profile
CREATE POLICY "users_update_own_policy" ON users FOR UPDATE USING (auth.uid() = id);

-- 3. Allow user creation during signup (needed for handle_new_user function)
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (true);

-- 4. Admin management through function-based approach
-- Instead of using RLS policy that queries users table, we'll use a secure function
-- The admin policies for posts, comments, etc. will be updated to use this function

-- Create a secure function to check if current user is admin
-- This function uses SECURITY DEFINER to bypass RLS when checking admin status
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

-- Now update the admin policies for other tables to use the function instead of direct queries
-- This prevents the infinite recursion issue

-- Drop existing admin policies
DROP POLICY IF EXISTS "admin_manage_all_posts" ON posts;
DROP POLICY IF EXISTS "admin_moderate_all_comments" ON comments;
DROP POLICY IF EXISTS "admin_manage_all_post_tags" ON post_tags;

-- Recreate admin policies using the secure function
CREATE POLICY "admin_manage_all_posts" ON posts FOR ALL USING (
    public.is_current_user_admin()
);

CREATE POLICY "admin_moderate_all_comments" ON comments FOR ALL USING (
    public.is_current_user_admin()
);

CREATE POLICY "admin_manage_all_post_tags" ON post_tags FOR ALL USING (
    public.is_current_user_admin()
);

-- Update admin functions to use the new approach
CREATE OR REPLACE FUNCTION public.admin_change_user_role(
    target_user_id UUID,
    new_role VARCHAR(20)
) 
RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if the current user is an admin using the secure function
    IF NOT public.is_current_user_admin() THEN
        RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
    
    -- Validate the new role
    IF new_role NOT IN ('user', 'author', 'admin') THEN
        RAISE EXCEPTION 'Invalid role: %', new_role;
    END IF;
    
    -- Update the user role
    UPDATE users 
    SET role = new_role, updated_at = NOW()
    WHERE id = target_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Update analytics function
CREATE OR REPLACE FUNCTION public.get_platform_analytics()
RETURNS TABLE (
    total_users BIGINT,
    total_posts BIGINT,
    total_comments BIGINT,
    total_published_posts BIGINT,
    total_views BIGINT,
    active_authors BIGINT
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if the current user is an admin using the secure function
    IF NOT public.is_current_user_admin() THEN
        RAISE EXCEPTION 'Only admins can access platform analytics';
    END IF;
    
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM users)::BIGINT as total_users,
        (SELECT COUNT(*) FROM posts)::BIGINT as total_posts,
        (SELECT COUNT(*) FROM comments)::BIGINT as total_comments,
        (SELECT COUNT(*) FROM posts WHERE status = 'published')::BIGINT as total_published_posts,
        (SELECT COALESCE(SUM(views), 0) FROM posts)::BIGINT as total_views,
        (SELECT COUNT(DISTINCT author_id) FROM posts WHERE status = 'published')::BIGINT as active_authors;
END;
$$ LANGUAGE plpgsql;

-- Update existing admin policies for categories and tags to use the function approach
DROP POLICY IF EXISTS "Only admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Only admins can manage tags" ON tags;

CREATE POLICY "admin_manage_categories" ON categories FOR ALL USING (
    public.is_current_user_admin()
);

CREATE POLICY "admin_manage_tags" ON tags FOR ALL USING (
    public.is_current_user_admin()
);

-- Add comments for documentation
COMMENT ON FUNCTION public.is_current_user_admin IS 'Securely checks if the current authenticated user has admin role, prevents RLS infinite recursion';
COMMENT ON POLICY "users_select_policy" ON users IS 'Allows all users to view profiles without recursion';
COMMENT ON POLICY "users_update_own_policy" ON users IS 'Allows users to update only their own profile';
COMMENT ON POLICY "users_insert_policy" ON users IS 'Allows user creation during signup process';

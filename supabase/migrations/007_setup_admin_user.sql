-- Setup Admin User for shubhorai12@gmail.com
-- This migration grants comprehensive admin powers to the specified user

-- Update the handle_new_user function to assign admin role to specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        CASE 
            WHEN NEW.email = 'shubhorai12@gmail.com' THEN 'admin'
            WHEN NEW.email = 'admin@inkspace.com' THEN 'admin'
            ELSE 'author'  -- All other users are authors by default
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing user shubhorai12@gmail.com to admin role
UPDATE users 
SET role = 'admin' 
WHERE email = 'shubhorai12@gmail.com';

-- Create admin policies for comprehensive content management

-- Allow admins to manage all users (view, update roles, etc.)
CREATE POLICY "admin_manage_users" ON users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Allow admins to manage all posts (including other users' posts)
CREATE POLICY "admin_manage_all_posts" ON posts FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Allow admins to moderate all comments
CREATE POLICY "admin_moderate_all_comments" ON comments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Grant admin access to post_tags
CREATE POLICY "admin_manage_all_post_tags" ON post_tags FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Ensure the specific user has confirmed email (if not already)
-- This will allow immediate login without email confirmation issues
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email = 'shubhorai12@gmail.com';

-- Create a function to allow admins to change user roles
CREATE OR REPLACE FUNCTION public.admin_change_user_role(
    target_user_id UUID,
    new_role VARCHAR(20)
) 
RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_role VARCHAR(20);
BEGIN
    -- Check if the current user is an admin
    SELECT role INTO current_user_role 
    FROM users 
    WHERE id = auth.uid();
    
    IF current_user_role != 'admin' THEN
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

-- Create a function to get platform analytics (admin only)
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
    -- Check if the current user is an admin
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    ) THEN
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

-- Grant necessary permissions for admin functions
GRANT EXECUTE ON FUNCTION public.admin_change_user_role(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_analytics() TO authenticated;

-- Create comment to track this migration
COMMENT ON FUNCTION public.admin_change_user_role IS 'Allows admin users to change roles of other users';
COMMENT ON FUNCTION public.get_platform_analytics IS 'Provides platform-wide analytics data for admin users';

-- Log the admin setup
INSERT INTO categories (name, slug, description, color) 
VALUES ('Admin', 'admin', 'Administrative posts and announcements', '#dc2626')
ON CONFLICT (slug) DO NOTHING;

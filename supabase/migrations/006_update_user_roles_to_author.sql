-- Update user role system to make all users authors by default
-- This allows all users to publish blog posts

-- First, update the handle_new_user function to assign 'author' role by default
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
            WHEN NEW.email = 'admin@inkspace.com' THEN 'admin'
            ELSE 'author'  -- Changed from 'user' to 'author'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users with 'user' role to 'author' role
UPDATE users 
SET role = 'author' 
WHERE role = 'user';

-- Optional: If you want to keep some users as regular users, you can be more selective:
-- UPDATE users 
-- SET role = 'author' 
-- WHERE role = 'user' 
-- AND email NOT IN ('specificuser@example.com'); -- Add emails you want to keep as 'user'

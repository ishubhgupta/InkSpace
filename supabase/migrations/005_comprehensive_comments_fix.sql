-- Comprehensive Comments Fix
-- This migration completely fixes the comments system for authenticated users

-- First, let's check and fix the comments table structure
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);

-- Make author_id NOT NULL (required for RLS)
UPDATE comments SET author_id = '00000000-0000-0000-0000-000000000000' WHERE author_id IS NULL;
ALTER TABLE comments ALTER COLUMN author_id SET NOT NULL;

-- Drop ALL existing comment policies to start fresh
DROP POLICY IF EXISTS "Everyone can view approved comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
DROP POLICY IF EXISTS "Authors and admins can moderate comments" ON comments;

-- Create comprehensive new policies

-- 1. SELECT Policy: Allow viewing approved comments + own comments + comments on own posts
CREATE POLICY "view_comments_policy" ON comments FOR SELECT USING (
    status = 'approved' 
    OR auth.uid() = author_id 
    OR EXISTS (
        SELECT 1 FROM posts 
        WHERE posts.id = comments.post_id 
        AND posts.author_id = auth.uid()
    )
);

-- 2. INSERT Policy: Allow authenticated users to create comments
CREATE POLICY "create_comments_policy" ON comments FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = author_id
    AND content IS NOT NULL 
    AND length(trim(content)) > 0
);

-- 3. UPDATE Policy: Allow users to update their own comments
CREATE POLICY "update_own_comments_policy" ON comments FOR UPDATE USING (
    auth.uid() = author_id
) WITH CHECK (
    auth.uid() = author_id
);

-- 4. DELETE Policy: Allow users to delete their own comments
CREATE POLICY "delete_own_comments_policy" ON comments FOR DELETE USING (
    auth.uid() = author_id
);

-- 5. MODERATION Policy: Allow post authors and admins to moderate comments
CREATE POLICY "moderate_comments_policy" ON comments FOR UPDATE USING (
    -- Post authors can moderate comments on their posts
    EXISTS (
        SELECT 1 FROM posts 
        WHERE posts.id = comments.post_id 
        AND posts.author_id = auth.uid()
    )
    OR
    -- Admins can moderate any comments
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
) WITH CHECK (
    -- Only allow changing status and updated_at for moderation
    (OLD.content = NEW.content AND OLD.author_id = NEW.author_id)
);

-- Ensure RLS is enabled
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON comments TO authenticated;
GRANT USAGE ON SEQUENCE comments_id_seq TO authenticated;

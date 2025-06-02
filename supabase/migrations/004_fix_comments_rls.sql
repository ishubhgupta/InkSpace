-- Fix RLS policies for comments table
-- This migration fixes the Row Level Security policies for the comments table

-- Drop existing comment policies
DROP POLICY IF EXISTS "Everyone can view approved comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- Re-create comment policies with proper logic

-- Allow everyone to view approved comments, and users to see their own pending comments
CREATE POLICY "Everyone can view approved comments" ON comments FOR SELECT USING (
    status = 'approved' OR 
    auth.uid() = author_id OR
    EXISTS (
        SELECT 1 FROM posts 
        WHERE posts.id = comments.post_id 
        AND posts.author_id = auth.uid()
    )
);

-- Allow authenticated users to create comments
-- The user must be authenticated and the author_id must match the authenticated user
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = author_id
);

-- Allow users to update their own comments
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (
    auth.uid() = author_id
);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (
    auth.uid() = author_id
);

-- Allow post authors and admins to moderate comments on their posts
CREATE POLICY "Authors and admins can moderate comments" ON comments FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM posts 
        WHERE posts.id = comments.post_id 
        AND posts.author_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Seed data for InkSpace blog platform

-- Insert sample categories
INSERT INTO categories (id, name, slug, description, color) VALUES
    (uuid_generate_v4(), 'Technology', 'technology', 'Latest trends and insights in technology', '#3B82F6'),
    (uuid_generate_v4(), 'Design', 'design', 'UI/UX design principles and inspiration', '#10B981'),
    (uuid_generate_v4(), 'Business', 'business', 'Business strategies and entrepreneurship', '#F59E0B'),
    (uuid_generate_v4(), 'Personal', 'personal', 'Personal development and lifestyle', '#EF4444'),
    (uuid_generate_v4(), 'Programming', 'programming', 'Code tutorials and programming guides', '#8B5CF6'),
    (uuid_generate_v4(), 'Marketing', 'marketing', 'Digital marketing and growth strategies', '#EC4899')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample tags
INSERT INTO tags (id, name, slug) VALUES
    (uuid_generate_v4(), 'React', 'react'),
    (uuid_generate_v4(), 'Next.js', 'nextjs'),
    (uuid_generate_v4(), 'TypeScript', 'typescript'),
    (uuid_generate_v4(), 'JavaScript', 'javascript'),
    (uuid_generate_v4(), 'CSS', 'css'),
    (uuid_generate_v4(), 'HTML', 'html'),
    (uuid_generate_v4(), 'Node.js', 'nodejs'),
    (uuid_generate_v4(), 'Python', 'python'),
    (uuid_generate_v4(), 'Machine Learning', 'machine-learning'),
    (uuid_generate_v4(), 'AI', 'ai'),
    (uuid_generate_v4(), 'Web Development', 'web-development'),
    (uuid_generate_v4(), 'Mobile Development', 'mobile-development'),
    (uuid_generate_v4(), 'DevOps', 'devops'),
    (uuid_generate_v4(), 'Cloud Computing', 'cloud-computing'),
    (uuid_generate_v4(), 'Database', 'database'),
    (uuid_generate_v4(), 'API', 'api'),
    (uuid_generate_v4(), 'Security', 'security'),
    (uuid_generate_v4(), 'Performance', 'performance'),
    (uuid_generate_v4(), 'Testing', 'testing'),
    (uuid_generate_v4(), 'Tutorial', 'tutorial'),
    (uuid_generate_v4(), 'Best Practices', 'best-practices'),
    (uuid_generate_v4(), 'Productivity', 'productivity'),
    (uuid_generate_v4(), 'Tools', 'tools'),
    (uuid_generate_v4(), 'Open Source', 'open-source'),
    (uuid_generate_v4(), 'Career', 'career'),
    (uuid_generate_v4(), 'Remote Work', 'remote-work'),
    (uuid_generate_v4(), 'Startup', 'startup'),
    (uuid_generate_v4(), 'Freelancing', 'freelancing'),
    (uuid_generate_v4(), 'Leadership', 'leadership'),
    (uuid_generate_v4(), 'Innovation', 'innovation')
ON CONFLICT (slug) DO NOTHING;

-- Create sample admin user (this will be handled by the auth trigger)
-- The admin user should be created through the auth system

-- Note: Sample posts and comments should be created after users are properly set up through authentication
-- This is because posts and comments require valid author_id references

-- You can add sample posts after authentication is working:
/*
-- Sample posts (uncomment after setting up authentication)
INSERT INTO posts (title, slug, content, excerpt, status, author_id, category_id, published_at) VALUES
(
    'Getting Started with Next.js 14',
    'getting-started-nextjs-14',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Next.js 14 brings incredible new features that make building React applications faster and more efficient than ever before..."}]}]}',
    'Learn how to build modern web applications with the latest Next.js features including the App Router, Server Components, and more.',
    'published',
    '[USER_ID]', -- Replace with actual user ID
    (SELECT id FROM categories WHERE slug = 'programming'),
    NOW()
);
*/

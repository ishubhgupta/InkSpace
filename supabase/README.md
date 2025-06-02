# Supabase Database Setup

This directory contains the database migrations and setup scripts for the InkSpace blog platform.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key to your `.env.local` file

### 2. Run Migrations

You can run the migrations in several ways:

#### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Initialize Supabase in your project:
   ```bash
   supabase init
   ```

4. Link to your remote project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

5. Run migrations:
   ```bash
   supabase db push
   ```

#### Option B: Manual Setup via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `001_initial_schema.sql`
4. Run the script
5. Copy and paste the contents of `002_seed_data.sql`
6. Run the script

#### Option C: Using the provided setup script

Run the Node.js setup script:
```bash
npm run setup:db
```

### 3. Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try to register a new user account
3. Check that the user appears in the users table
4. Try creating a new blog post

## Database Schema

The database includes the following tables:

- **users**: User profiles and authentication data
- **categories**: Blog post categories
- **tags**: Blog post tags
- **posts**: Blog posts with content, metadata, and relationships
- **post_tags**: Many-to-many relationship between posts and tags
- **comments**: User comments on blog posts with threading support

## Row Level Security

All tables have Row Level Security (RLS) enabled with appropriate policies:

- Users can view all profiles but only edit their own
- Everyone can view published posts, authors can manage their own posts
- Only admins can manage categories and tags
- Comments are visible when approved, users can manage their own comments

## Features

- Automatic user profile creation on auth signup
- Automatic reading time calculation for posts
- Proper indexing for performance
- Trigger-based updated_at timestamps
- Hierarchical comments with parent-child relationships
- Role-based access control (user, author, admin)

## Troubleshooting

1. **Migration fails**: Check that you have the correct permissions and that the UUID extension is enabled
2. **RLS policies blocking access**: Verify that your user has the correct role assigned
3. **Auth integration not working**: Ensure the auth trigger function is properly set up

For more help, check the Supabase documentation or create an issue in the project repository.

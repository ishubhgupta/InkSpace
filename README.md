# InkSpace

<div align="center">
  <h1>🖋️ InkSpace</h1>
  <p><strong>A Modern Blog Platform Built with Next.js, TypeScript, and Supabase</strong></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#api-documentation">API</a>
  </p>
</div>

---

## ✨ Features

### 🔐 Authentication & User Management

- **Secure Authentication** with Supabase Auth and email confirmation
- **Role-based Access Control** (User, Author, Admin) with middleware protection
- **User Profiles** with customizable avatars and metadata
- **Comprehensive Auth Diagnostics** with built-in troubleshooting tools

### 📝 Content Management System

- **Rich Text Editor** powered by TipTap with full formatting support
- **Complete Workflow** - Draft → Publish → Archive with status management
- **Categories & Tags** system for advanced content organization
- **Automatic Reading Time** calculation based on content length
- **SEO-friendly URLs** with automatic slug generation
- **Featured Images** with AWS S3 integration and optimization

### 💬 Advanced Comment System

- **Threaded Comments** with hierarchical structure
- **Moderation Workflow** - pending, approved, rejected statuses
- **Role-based Permissions** for comment management
- **Real-time Updates** with live comment interactions

### 📊 Analytics & Dashboard

- **Comprehensive Dashboard** with post analytics and user management
- **Performance Metrics** including views, engagement, and reading statistics
- **User Role Management** with upgrade/downgrade capabilities
- **Content Statistics** with detailed insights and reporting

### 🎨 Modern UI/UX

- **Fully Responsive Design** optimized for all device sizes
- **Dark/Light Mode** with system preference detection
- **Beautiful Components** built with shadcn/ui and Radix UI
- **Smooth Animations** and micro-interactions
- **Accessibility-first** design following WCAG guidelines

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Modern component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible primitives
- **[TipTap](https://tiptap.dev/)** - Extensible rich text editor

### Backend & Database
- **[Supabase](https://supabase.com/)** - Complete backend platform
- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database
- **[Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)** - Database-level security

### File Storage & Media
- **[AWS S3](https://aws.amazon.com/s3/)** - Scalable cloud storage
- **[AWS SDK v3](https://aws.amazon.com/sdk-for-javascript/)** - Modern S3 integration

### Development & Quality
- **[ESLint](https://eslint.org/)** - Code quality and consistency
- **[Prettier](https://prettier.io/)** - Automated code formatting
- **[TypeScript Strict Mode](https://www.typescriptlang.org/)** - Enhanced type safety

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### 1. Clone & Setup

```bash
git clone https://github.com/ishubhgupta/inkspace.git
cd inkspace
npm install
```

### 2. Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AWS S3 Configuration (Optional - for file uploads)
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Application Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

### 3. Database Setup

#### Option A: Automated Setup (Recommended)

```bash
# Verify database connection
npm run db:verify

# Interactive database setup
npm run db:setup

# Apply RLS policies if needed
npm run db:fix-rls
```

#### Option B: Manual Supabase Setup

1. Create a new project at [Supabase Dashboard](https://app.supabase.com)
2. Navigate to SQL Editor
3. Execute migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql`
   - `supabase/migrations/003_fix_user_signup_rls.sql`
   - `supabase/migrations/004_comments_system.sql`
   - `supabase/migrations/005_comprehensive_comments_fix.sql`

### 4. Start Development

```bash
npm run dev
```

Access the application at `http://localhost:3002`

### 5. Create Admin User

```bash
# Register through the UI first, then run:
npm run user:upgrade
```

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 3002 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint code analysis |
| **Database Management** |
| `npm run db:setup` | Interactive database setup wizard |
| `npm run db:verify` | Verify database configuration |
| `npm run db:fix-rls` | Fix Row Level Security policies |
| **Authentication Tools** |
| `npm run auth:diagnose` | Comprehensive auth diagnostics |
| `npm run auth:fix-email` | Fix email confirmation issues |
| **Testing & Validation** |
| `npm run test:posts` | Test post CRUD operations |
| `npm run test:workflow` | Test complete blog workflow |
| **User Management** |
| `npm run user:upgrade` | Upgrade user role to author/admin |

## 🗃️ Database Architecture

### Core Tables

```sql
users           # User profiles and authentication
├── categories  # Blog post categories with styling
├── tags        # Content tags for organization
├── posts       # Blog posts with rich content
│   ├── post_tags (junction table)
│   └── comments # Hierarchical comment system
```

### Security Features

- **Row Level Security (RLS)** on all tables
- **Role-based Access Control** with automatic policy enforcement
- **Automatic Triggers** for timestamps and data validation
- **Foreign Key Constraints** ensuring data integrity
- **Optimized Indexes** for query performance

### User Roles & Permissions

| Role | Dashboard Access | Post Management | Comment Moderation | User Management |
|------|------------------|-----------------|-------------------|-----------------|
| **User** | ❌ | ❌ | Own comments only | Own profile only |
| **Author** | ✅ | Own posts only | Own post comments | Own profile only |
| **Admin** | ✅ | All posts | All comments | All users |

## 🎨 Project Structure

```
inkspace/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── posts/         # Post management
│   │   ├── categories/    # Category management
│   │   └── tags/          # Tag management
│   ├── (public)/          # Public-facing pages
│   │   ├── blog/          # Blog listing and posts
│   │   └── page.tsx       # Homepage
│   ├── api/               # API routes
│   └── globals.css        # Global styles and CSS variables
├── components/            # Reusable React components
│   ├── auth/              # Authentication components
│   ├── blog/              # Blog-specific components
│   ├── dashboard/         # Dashboard components
│   ├── editor/            # Rich text editor components
│   ├── layout/            # Layout components (Header, Sidebar)
│   ├── ui/                # shadcn/ui components
│   └── forms/             # Form components
├── lib/                   # Utility libraries
│   ├── supabase/          # Supabase client configurations
│   ├── aws/               # AWS S3 integration
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Helper functions
├── supabase/              # Database setup
│   ├── migrations/        # SQL migration files
│   └── README.md          # Database documentation
├── scripts/               # Utility and diagnostic scripts
├── types/                 # TypeScript type definitions
│   ├── auth.ts           # Authentication types
│   ├── blog.ts           # Blog-related types
│   └── database.ts       # Database schema types
├── docs/                  # Project documentation
└── reports/               # Test and performance reports
```

## 🔐 Authentication & Security

### Authentication Flow

1. **Registration** with email confirmation
2. **Email Verification** with automatic user profile creation
3. **Role Assignment** based on user type
4. **Session Management** with Supabase Auth
5. **Middleware Protection** for route access control

### Security Features

- **Email Confirmation** workflow with retry mechanisms
- **Password Requirements** with strength validation
- **Session Security** with automatic token refresh
- **CSRF Protection** via Supabase Auth
- **XSS Prevention** with content sanitization
- **SQL Injection Protection** via Supabase RLS

## 📡 API Documentation

### Authentication Endpoints

```
POST /api/auth/login      # User authentication
POST /api/auth/register   # User registration
POST /api/auth/logout     # Session termination
GET  /api/auth/user       # Current user info
```

### Blog Management Endpoints

```
GET    /api/posts                # List published posts (paginated)
GET    /api/posts/[slug]         # Get post by slug
POST   /api/posts                # Create new post (authors+)
PUT    /api/posts/[id]           # Update post (author/admin)
DELETE /api/posts/[id]           # Delete post (author/admin)
```

### Comment System Endpoints

```
GET    /api/posts/[id]/comments  # Get post comments (hierarchical)
POST   /api/posts/[id]/comments  # Create comment (authenticated)
PUT    /api/comments/[id]        # Update comment (author only)
DELETE /api/comments/[id]        # Delete comment (author/admin)
PUT    /api/comments/[id]/status # Moderate comment (post author+)
```

### Content Management Endpoints

```
GET    /api/categories           # List all categories
POST   /api/categories           # Create category (admin only)
PUT    /api/categories/[id]      # Update category (admin only)
DELETE /api/categories/[id]      # Delete category (admin only)

GET    /api/tags                 # List all tags
POST   /api/tags                 # Create tag (admin only)
PUT    /api/tags/[id]            # Update tag (admin only)
DELETE /api/tags/[id]            # Delete tag (admin only)
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository** to [Vercel](https://vercel.com)
2. **Set Environment Variables** in Vercel dashboard
3. **Configure Custom Domain** (optional)
4. **Deploy** - automatic on every push to main branch

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
AWS_ACCESS_KEY_ID=your_production_aws_key
AWS_SECRET_ACCESS_KEY=your_production_aws_secret
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_production_bucket
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🎯 Key Features in Detail

### Rich Text Editor
- **TipTap Integration** with custom extensions
- **Image Upload** with drag-and-drop support
- **Link Management** with URL validation
- **Format Toolbar** with keyboard shortcuts
- **Auto-save** functionality for drafts

### Comment System
- **Threaded Replies** with unlimited nesting
- **Moderation Queue** with approval workflow
- **Real-time Updates** via Supabase Realtime
- **Spam Protection** with content filtering
- **Email Notifications** for new comments

### Dashboard Analytics
- **Post Performance** metrics and insights
- **User Engagement** tracking and analytics
- **Content Statistics** with visual charts
- **Recent Activity** feed and notifications

### Performance Optimizations
- **Image Optimization** with Next.js Image component
- **Code Splitting** for faster page loads
- **Caching Strategy** with proper cache headers
- **SEO Optimization** with meta tags and structured data

## 🧪 Testing & Quality Assurance

### Automated Testing

```bash
# Test complete blog workflow
npm run test:workflow

# Test post operations
npm run test:posts

# Verify database setup
npm run db:verify

# Diagnose authentication issues
npm run auth:diagnose
```

### Manual Testing Checklist

- [ ] User registration and email confirmation
- [ ] Login/logout functionality
- [ ] Post creation, editing, and publishing
- [ ] Comment creation and moderation
- [ ] Category and tag management
- [ ] File upload functionality
- [ ] Role-based access control
- [ ] Responsive design across devices

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🙋‍♂️ Support

If you encounter any issues or have questions:

1. Check the [existing issues](https://github.com/ishubhgupta/inkspace/issues)
2. Review the documentation in the `/docs` folder
3. Run diagnostic scripts for troubleshooting

## 🎯 Roadmap

- [ ] **Email Newsletters** - Subscription management and automated sending
- [ ] **SEO Optimization** - Enhanced meta tags and schema markup
- [ ] **Social Media Integration** - Share buttons and Open Graph tags
- [ ] **Advanced Analytics** - Detailed engagement metrics and reporting
- [ ] **Content Scheduling** - Publish posts at specific times
- [ ] **Multi-language Support** - Internationalization and localization
- [ ] **Plugin System** - Extensible architecture for third-party integrations
- [ ] **Mobile App** - React Native companion application
- [ ] **AI Content Assistant** - Writing suggestions and optimization
- [ ] **Advanced Search** - Full-text search with filters and facets

---

<div align="center">
  <p>Made with ❤️ by Shubh Gupta for modern blogging</p>
  <p>
    <a href="https://github.com/ishubhgupta/inkspace">⭐ View on GitHub</a> •
    <a href="#support">💬 Get Support</a>
  </p>
</div>

import { z } from 'zod';

export const SignInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export const SignUpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(20, { message: 'Username must be less than 20 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' }),
  full_name: z.string().optional(),
});

export const PostSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(200),
  slug: z.string().min(1, { message: 'Slug is required' }).max(200),
  content: z.any().refine(val => val !== null && val !== undefined, { 
    message: 'Content is required' 
  }),
  excerpt: z.string().optional().nullable(),
  featured_image: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']),
});

export const CategorySchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).max(100),
  slug: z.string().min(1, { message: 'Slug is required' }).max(100),
  description: z.string().optional().nullable(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { 
    message: 'Color must be a valid hex color code' 
  }),
});

export const TagSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).max(50),
  slug: z.string().min(1, { message: 'Slug is required' }).max(50),
});

export const CommentSchema = z.object({
  content: z.string().min(1, { message: 'Comment cannot be empty' }),
  post_id: z.string().min(1),
  parent_id: z.string().optional().nullable(),
});

export const UserUpdateSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(20, { message: 'Username must be less than 20 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' }),
  full_name: z.string().optional(),
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
});
import { Json } from "./database";

export type PostStatus = "draft" | "published" | "archived";
export type CommentStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "author" | "admin";

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: Json;
  excerpt?: string;
  featured_image?: string;
  status: PostStatus;
  author_id: string;
  category_id?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  views: number;
  reading_time: number;
  author?: User;
  category?: Category;
  tags?: Tag[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  parent_id?: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
  author?: User;
  replies?: Comment[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type PostFormData = {
  title: string;
  content: Json;
  excerpt?: string;
  featured_image?: string;
  category_id?: string;
  tags?: string[];
  status: PostStatus;
};

export type CategoryFormData = {
  name: string;
  slug: string;
  description?: string;
  color: string;
};

export type TagFormData = {
  name: string;
  slug: string;
};

export type CommentFormData = {
  content: string;
  post_id: string;
  parent_id?: string | null;
  // For authenticated users, these fields are optional as they come from user profile
  author_name?: string;
  author_email?: string;
  author_url?: string;
};

export type UserFormData = {
  username: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
};

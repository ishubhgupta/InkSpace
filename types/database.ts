export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          role: 'user' | 'author' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'author' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'author' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: Json
          excerpt: string | null
          featured_image: string | null
          status: 'draft' | 'published' | 'archived'
          author_id: string
          category_id: string | null
          published_at: string | null
          created_at: string
          updated_at: string
          views: number
          reading_time: number
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: Json
          excerpt?: string | null
          featured_image?: string | null
          status?: 'draft' | 'published' | 'archived'
          author_id: string
          category_id?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
          views?: number
          reading_time?: number
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: Json
          excerpt?: string | null
          featured_image?: string | null
          status?: 'draft' | 'published' | 'archived'
          author_id?: string
          category_id?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
          views?: number
          reading_time?: number
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          post_id: string
          author_id: string
          parent_id: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          post_id: string
          author_id: string
          parent_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          post_id?: string
          author_id?: string
          parent_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
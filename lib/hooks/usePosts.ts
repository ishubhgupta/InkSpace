'use client'

import { createClient } from '@/lib/supabase/client'
import { Post, PostFormData } from '@/types/blog'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { calculateReadingTime } from '../utils/reading-time'
import { slugify } from '../utils/slugify'

export function usePosts() {
  const supabase = createClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const createPost = async (data: PostFormData, userId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Generate slug if not provided
      const slug = data.title ? slugify(data.title) : ''
      
      // Calculate reading time from HTML content
      const contentText = typeof data.content === 'string' ? data.content : JSON.stringify(data.content)
      const readingTime = calculateReadingTime(contentText)
      
      const { error: postError, data: postData } = await supabase
        .from('posts')
        .insert({
          title: data.title,          slug,
          content: data.content,
          excerpt: data.excerpt || null,
          featured_image: data.featured_image || null,
          status: data.status,
          author_id: userId,
          category_id: data.category_id || null,
          reading_time: readingTime,
          published_at: data.status === 'published' ? new Date().toISOString() : null,
        })
        .select()
        .single()

      if (postError) throw postError
      if (!postData) throw new Error('Failed to create post')

      // Add tags if provided
      if (data.tags && data.tags.length > 0) {
        const postTags = data.tags.map(tagId => ({
          post_id: postData.id,
          tag_id: tagId,
        }))

        const { error: tagsError } = await supabase
          .from('post_tags')
          .insert(postTags)

        if (tagsError) throw tagsError
      }

      router.refresh()
      return postData
    } catch (err: any) {
      setError(err?.message || 'An error occurred while creating the post')
      return null
    } finally {
      setIsLoading(false)
    }
  }
  const updatePost = async (id: string, data: Partial<PostFormData>) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Calculate reading time if content is updated
      const readingTime = data.content 
        ? calculateReadingTime(typeof data.content === 'string' ? data.content : JSON.stringify(data.content))
        : undefined

      // Update slug if title is updated
      const slug = data.title ? slugify(data.title) : undefined
      
      const { error: postError, data: postData } = await supabase
        .from('posts')
        .update({
          title: data.title,
          slug,
          content: data.content,
          excerpt: data.excerpt,
          featured_image: data.featured_image,
          status: data.status,
          category_id: data.category_id,
          reading_time: readingTime,
          published_at: data.status === 'published' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (postError) throw postError
      
      // Update tags if provided
      if (data.tags) {
        // First remove existing tags
        const { error: deleteError } = await supabase
          .from('post_tags')
          .delete()
          .eq('post_id', id)
          
        if (deleteError) throw deleteError
        
        // Then add new tags
        if (data.tags.length > 0) {
          const postTags = data.tags.map(tagId => ({
            post_id: id,
            tag_id: tagId,
          }))
  
          const { error: tagsError } = await supabase
            .from('post_tags')
            .insert(postTags)
  
          if (tagsError) throw tagsError
        }
      }

      router.refresh()
      return postData
    } catch (err: any) {
      setError(err?.message || 'An error occurred while updating the post')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deletePost = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) throw error

      router.refresh()
      return true
    } catch (err: any) {
      setError(err?.message || 'An error occurred while deleting the post')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createPost,
    updatePost,
    deletePost,
    isLoading,
    error,
  }
}
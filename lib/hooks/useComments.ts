'use client'

import { createClient } from '@/lib/supabase/client'
import { Comment, CommentFormData } from '@/types/blog'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function useComments() {
  const supabase = createClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createComment = async (data: CommentFormData, userId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { error: commentError, data: commentData } = await supabase
        .from('comments')
        .insert({
          content: data.content,
          post_id: data.post_id,
          author_id: userId,
          parent_id: data.parent_id || null,
          status: 'approved', // Auto-approve for now, in a real app this might be 'pending' for moderation
        })
        .select()
        .single()

      if (commentError) throw commentError

      router.refresh()
      return commentData
    } catch (err: any) {
      setError(err?.message || 'An error occurred while creating the comment')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateComment = async (id: string, content: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { error, data } = await supabase
        .from('comments')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      router.refresh()
      return data
    } catch (err: any) {
      setError(err?.message || 'An error occurred while updating the comment')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteComment = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)

      if (error) throw error

      router.refresh()
      return true
    } catch (err: any) {
      setError(err?.message || 'An error occurred while deleting the comment')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const moderateComment = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { error, data } = await supabase
        .from('comments')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      router.refresh()
      return data
    } catch (err: any) {
      setError(err?.message || 'An error occurred while moderating the comment')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createComment,
    updateComment,
    deleteComment,
    moderateComment,
    isLoading,
    error,
  }
}
'use client'

import { createClient } from '@/lib/supabase/client'
import { TagFormData } from '@/types/blog'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { slugify } from '../utils/slugify'

export function useTags() {
  const supabase = createClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTag = async (data: TagFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Generate slug if not provided
      const slug = data.slug || slugify(data.name)
      
      const { error: tagError, data: tagData } = await supabase
        .from('tags')
        .insert({
          name: data.name,
          slug,
        })
        .select()
        .single()

      if (tagError) throw tagError
      if (!tagData) throw new Error('Failed to create tag')

      router.refresh()
      return tagData
    } catch (err: any) {
      setError(err?.message || 'An error occurred while creating the tag')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateTag = async (id: string, data: Partial<TagFormData>) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const updateData: any = { ...data }
      
      // Generate slug if name is updated but slug is not provided
      if (data.name && !data.slug) {
        updateData.slug = slugify(data.name)
      }

      const { error: tagError, data: tagData } = await supabase
        .from('tags')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (tagError) throw tagError
      if (!tagData) throw new Error('Failed to update tag')

      router.refresh()
      return tagData
    } catch (err: any) {
      setError(err?.message || 'An error occurred while updating the tag')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTag = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)

      if (error) throw error

      router.refresh()
      return true
    } catch (err: any) {
      setError(err?.message || 'An error occurred while deleting the tag')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createTag,
    updateTag,
    deleteTag,
    isLoading,
    error,
  }
}

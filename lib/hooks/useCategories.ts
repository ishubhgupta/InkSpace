'use client'

import { createClient } from '@/lib/supabase/client'
import { CategoryFormData } from '@/types/blog'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { slugify } from '../utils/slugify'

export function useCategories() {
  const supabase = createClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCategory = async (data: CategoryFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Generate slug if not provided
      const slug = data.slug || slugify(data.name)
      
      const { error: categoryError, data: categoryData } = await supabase
        .from('categories')
        .insert({
          name: data.name,
          slug,
          description: data.description || null,
          color: data.color,
        })
        .select()
        .single()

      if (categoryError) throw categoryError
      if (!categoryData) throw new Error('Failed to create category')

      router.refresh()
      return categoryData
    } catch (err: any) {
      setError(err?.message || 'An error occurred while creating the category')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateCategory = async (id: string, data: Partial<CategoryFormData>) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const updateData: any = { ...data }
      
      // Generate slug if name is updated but slug is not provided
      if (data.name && !data.slug) {
        updateData.slug = slugify(data.name)
      }

      const { error: categoryError, data: categoryData } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (categoryError) throw categoryError
      if (!categoryData) throw new Error('Failed to update category')

      router.refresh()
      return categoryData
    } catch (err: any) {
      setError(err?.message || 'An error occurred while updating the category')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      router.refresh()
      return true
    } catch (err: any) {
      setError(err?.message || 'An error occurred while deleting the category')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    isLoading,
    error,
  }
}

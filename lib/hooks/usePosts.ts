'use client'

import { createClient } from '@/lib/supabase/client'
import { Post, PostFormData } from '@/types/blog'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { calculateReadingTime } from '../utils/reading-time'
import { slugify } from '../utils/slugify'
import { validateAndProcessContent, validatePostMetadata } from '../utils/content-processor'

// Configuration for robust publishing
const BASE_TIMEOUT = 15000 // 15 seconds base timeout
const MAX_TIMEOUT = 120000 // 2 minutes max timeout
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second
const LARGE_CONTENT_THRESHOLD = 50000 // 50KB

// Calculate dynamic timeout based on content size
function calculateTimeout(contentSize: number): number {
  if (contentSize < 10000) return BASE_TIMEOUT // Small content: 15s
  if (contentSize < 50000) return BASE_TIMEOUT * 2 // Medium content: 30s  
  if (contentSize < 200000) return BASE_TIMEOUT * 4 // Large content: 60s
  return MAX_TIMEOUT // Very large content: 120s
}

// Utility function to add timeout to any promise
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
  )
  return Promise.race([promise, timeout])
}

// Utility function to retry operations with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = RETRY_DELAY
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError.message}`)
      }

      // Exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

export function usePosts() {
  const supabase = createClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const createPost = async (data: PostFormData, userId: string) => {
    try {
      setIsLoading(true)
      setError(null)
        console.log('Starting post creation...', { title: data.title, status: data.status })
      
      // Calculate timeout based on content size
      const contentText = typeof data.content === 'string' ? data.content : JSON.stringify(data.content)
      const dynamicTimeout = calculateTimeout(contentText.length)
      
      console.log(`Using dynamic timeout: ${dynamicTimeout}ms for content size: ${contentText.length} bytes`)
      
      const result = await withTimeout(
        withRetry(async () => {
          // For very large content, use fast processing to avoid timeouts
          const isLargeContent = contentText.length > LARGE_CONTENT_THRESHOLD
          
          let processedContent = contentText
          let contentValidation: any = { isValid: true, warnings: [], errors: [] }
          
          if (isLargeContent) {
            console.log('Large content detected, using fast processing...')
            // For large content, just remove scripts for safety without full validation
            processedContent = contentText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          } else {
            // Full validation for smaller content
            contentValidation = validateAndProcessContent(contentText, {
              sanitize: true,
              validateSize: true,
              stripEmptyTags: true
            })
            
            if (!contentValidation.isValid) {
              throw new Error(`Content validation failed: ${contentValidation.errors.join(', ')}`)
            }
            
            processedContent = contentValidation.processedContent || contentText
          }
          
          // Validate metadata
          const metadataValidation = validatePostMetadata({
            title: data.title,
            excerpt: data.excerpt || undefined
          })
          
          if (!metadataValidation.isValid) {
            throw new Error(`Metadata validation failed: ${metadataValidation.errors.join(', ')}`)
          }
          
          // Log warnings if any
          if (contentValidation.warnings.length > 0) {
            console.warn('Content validation warnings:', contentValidation.warnings)
          }
          if (metadataValidation.warnings.length > 0) {
            console.warn('Metadata validation warnings:', metadataValidation.warnings)
          }
          
          // Generate slug if not provided
          const slug = data.title ? slugify(data.title) : ''
          
          // Calculate reading time
          const readingTime = calculateReadingTime(processedContent)
          console.log('Inserting post into database...', { 
            slug, 
            readingTime, 
            contentLength: processedContent.length,
            isLargeContent 
          })
          
          const { error: postError, data: postData } = await supabase
            .from('posts')
            .insert({
              title: data.title,
              slug,
              content: processedContent,
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

          if (postError) {
            console.error('Post insertion error:', postError)
            throw postError
          }
          if (!postData) {
            console.error('Post creation returned no data')
            throw new Error('Failed to create post - no data returned')
          }

          console.log('Post created successfully:', postData.id)

          // Add tags if provided (non-blocking - won't fail post creation)
          if (data.tags && data.tags.length > 0) {
            console.log('Adding tags...', data.tags)
            
            try {
              const postTags = data.tags.map(tagId => ({
                post_id: postData.id,
                tag_id: tagId,
              }))

              const { error: tagsError } = await supabase
                .from('post_tags')
                .insert(postTags)

              if (tagsError) {
                console.warn('Tags insertion failed (non-blocking):', tagsError)
                // Don't throw - let post creation succeed even if tags fail
              } else {
                console.log('Tags added successfully')
              }
            } catch (tagError) {
              console.warn('Tag insertion failed (non-blocking):', tagError)
              // Don't throw - let post creation succeed
            }
          }

          return postData
        }),
        dynamicTimeout
      )

      console.log('Post creation completed successfully')
      router.refresh()
      return result
    } catch (err: any) {
      console.error('Post creation failed:', err)
      const errorMessage = err?.message || 'An error occurred while creating the post'
      setError(errorMessage)
      return null    } finally {
      setIsLoading(false)
    }
  }
  
  const updatePost = async (id: string, data: Partial<PostFormData>) => {
    try {
      setIsLoading(true)
      setError(null)
        console.log('Starting post update...', { id, title: data.title, status: data.status })
      
      // Calculate timeout based on content size
      const contentText = data.content ? (typeof data.content === 'string' ? data.content : JSON.stringify(data.content)) : ''
      const dynamicTimeout = calculateTimeout(contentText.length)
      
      console.log(`Using dynamic timeout: ${dynamicTimeout}ms for content size: ${contentText.length} bytes`)
      
      const result = await withTimeout(
        withRetry(async () => {
          // Validate and process content if provided
          let processedContent = data.content
          let readingTime = undefined
          
          if (data.content) {
            const isLargeContent = contentText.length > LARGE_CONTENT_THRESHOLD
            
            if (isLargeContent) {
              console.log('Large content detected, using fast processing...')
              // For large content, just remove scripts for safety without full validation
              processedContent = contentText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            } else {
              // Full validation for smaller content
              const contentValidation = validateAndProcessContent(contentText, {
                sanitize: true,
                validateSize: true,
                stripEmptyTags: true
              })
              
              if (!contentValidation.isValid) {
                throw new Error(`Content validation failed: ${contentValidation.errors.join(', ')}`)
              }
              
              if (contentValidation.warnings.length > 0) {
                console.warn('Content validation warnings:', contentValidation.warnings)
              }
              
              processedContent = contentValidation.processedContent || contentText
            }
            
            readingTime = calculateReadingTime(processedContent)
          }
          
          // Validate metadata if title is provided
          if (data.title) {
            const metadataValidation = validatePostMetadata({
              title: data.title,
              excerpt: data.excerpt || undefined
            })
            
            if (!metadataValidation.isValid) {
              throw new Error(`Metadata validation failed: ${metadataValidation.errors.join(', ')}`)
            }
            
            if (metadataValidation.warnings.length > 0) {
              console.warn('Metadata validation warnings:', metadataValidation.warnings)
            }
          }

          // Update slug if title is updated
          const slug = data.title ? slugify(data.title) : undefined
          
          console.log('Updating post in database...', { 
            slug, 
            readingTime, 
            contentLength: processedContent ? String(processedContent).length : 0 
          })
          
          const { error: postError, data: postData } = await supabase
            .from('posts')
            .update({
              title: data.title,
              slug,
              content: processedContent,
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

          if (postError) {
            console.error('Post update error:', postError)
            throw postError
          }
          
          console.log('Post updated successfully')
          
          // Update tags if provided (non-blocking)
          if (data.tags !== undefined) {
            console.log('Updating tags...', data.tags)
            
            try {
              // First remove existing tags
              const { error: deleteError } = await supabase
                .from('post_tags')
                .delete()
                .eq('post_id', id)
                
              if (deleteError) {
                console.warn('Tags deletion failed (non-blocking):', deleteError)
              }
              
              // Then add new tags
              if (data.tags.length > 0) {
                const postTags = data.tags.map(tagId => ({
                  post_id: id,
                  tag_id: tagId,
                }))
        
                const { error: tagsError } = await supabase
                  .from('post_tags')
                  .insert(postTags)
        
                if (tagsError) {
                  console.warn('Tags insertion failed (non-blocking):', tagsError)
                } else {
                  console.log('Tags updated successfully')
                }
              }
            } catch (tagError) {
              console.warn('Tag update failed (non-blocking):', tagError)
              // Don't throw - let post update succeed
            }
          }

          return postData
        }),
        dynamicTimeout
      )

      console.log('Post update completed successfully')
      router.refresh()
      return result
    } catch (err: any) {
      console.error('Post update failed:', err)
      const errorMessage = err?.message || 'An error occurred while updating the post'
      setError(errorMessage)
      return null    } finally {
      setIsLoading(false)
    }
  }

  const deletePost = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Starting post deletion...', { id })
      
      // Use a shorter timeout for deletion operations
      const deleteTimeout = BASE_TIMEOUT // 15 seconds should be enough for deletion
      
      const result = await withTimeout(
        withRetry(async () => {
          const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id)

          if (error) {
            console.error('Post deletion error:', error)
            throw error
          }
          
          console.log('Post deleted successfully')
          return true
        }),
        deleteTimeout
      )

      router.refresh()
      return result
    } catch (err: any) {
      console.error('Post deletion failed:', err)
      const errorMessage = err?.message || 'An error occurred while deleting the post'
      setError(errorMessage)
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
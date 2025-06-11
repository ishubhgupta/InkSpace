/**
 * Content processing utilities for robust blog post handling
 * Handles sanitization, validation, and processing of blog content
 */

import DOMPurify from 'isomorphic-dompurify'

const MAX_CONTENT_SIZE = 5 * 1024 * 1024 // 5MB limit
const MAX_TITLE_LENGTH = 200
const MAX_EXCERPT_LENGTH = 500

export interface ContentValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  processedContent?: string
}

export interface ProcessingOptions {
  sanitize?: boolean
  validateSize?: boolean
  stripEmptyTags?: boolean
  compressImages?: boolean
}

/**
 * Validates and processes blog post content
 */
export function validateAndProcessContent(
  content: string,
  options: ProcessingOptions = {}
): ContentValidationResult {
  const {
    sanitize = true,
    validateSize = true,
    stripEmptyTags = true,
  } = options

  const errors: string[] = []
  const warnings: string[] = []
  let processedContent = content

  try {
    // Size validation
    if (validateSize && content.length > MAX_CONTENT_SIZE) {
      errors.push(`Content size (${Math.round(content.length / 1024)}KB) exceeds maximum allowed size (${Math.round(MAX_CONTENT_SIZE / 1024)}KB)`)
    }

    // Content sanitization
    if (sanitize) {
      processedContent = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'strong', 'em', 'u', 's',
          'blockquote', 'ul', 'ol', 'li',
          'a', 'img', 'figure', 'figcaption',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'code', 'pre', 'hr', 'div', 'span'
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title', 'class', 'id',
          'width', 'height', 'target', 'rel'
        ]
      })
    }

    // Strip empty tags
    if (stripEmptyTags) {
      processedContent = processedContent
        .replace(/<p><\/p>/g, '')
        .replace(/<div><\/div>/g, '')
        .replace(/<span><\/span>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    }

    // Check for malformed HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = processedContent
    
    if (tempDiv.innerHTML !== processedContent) {
      warnings.push('Content contains malformed HTML that was auto-corrected')
    }

    // Check for large images
    const imgTags = processedContent.match(/<img[^>]+>/g) || []
    if (imgTags.length > 10) {
      warnings.push(`Content contains ${imgTags.length} images, which may slow down loading`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      processedContent
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Content processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings
    }
  }
}

/**
 * Validates blog post metadata
 */
export function validatePostMetadata(data: {
  title: string
  excerpt?: string
  slug?: string
}): ContentValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Title validation
  if (!data.title || !data.title.trim()) {
    errors.push('Title is required')
  } else if (data.title.length > MAX_TITLE_LENGTH) {
    errors.push(`Title is too long (${data.title.length}/${MAX_TITLE_LENGTH} characters)`)
  }

  // Excerpt validation
  if (data.excerpt && data.excerpt.length > MAX_EXCERPT_LENGTH) {
    warnings.push(`Excerpt is quite long (${data.excerpt.length}/${MAX_EXCERPT_LENGTH} characters)`)
  }

  // Slug validation
  if (data.slug) {
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugPattern.test(data.slug)) {
      warnings.push('Slug should only contain lowercase letters, numbers, and hyphens')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Processes content for search indexing
 */
export function extractTextContent(htmlContent: string): string {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent
  return tempDiv.textContent || tempDiv.innerText || ''
}

/**
 * Estimates content processing time for user feedback
 */
export function estimateProcessingTime(content: string): number {
  const size = content.length
  const imageCount = (content.match(/<img[^>]+>/g) || []).length
  
  // Base time + size factor + image processing time
  return Math.max(1000, size * 0.01 + imageCount * 500)
}

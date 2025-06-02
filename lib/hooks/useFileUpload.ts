'use client'

import { useState } from 'react'
import { uploadToS3, deleteFromS3 } from '@/lib/aws/s3'

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true)
      setError(null)
      setUploadProgress(0)

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB')
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed')
      }

      setUploadProgress(50)

      const fileUrl = await uploadToS3(file)
      
      setUploadProgress(100)
      return fileUrl
    } catch (err: any) {
      setError(err.message || 'Failed to upload file')
      return null
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const deleteFile = async (fileUrl: string): Promise<boolean> => {
    try {
      setError(null)
      await deleteFromS3(fileUrl)
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to delete file')
      return false
    }
  }

  return {
    uploadFile,
    deleteFile,
    isUploading,
    uploadProgress,
    error,
  }
}

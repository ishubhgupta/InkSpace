"use client";

import { useState } from "react";
import { storageService } from "@/lib/supabase/storageEnhanced";

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<{
    wasCompressed: boolean;
    originalSize: string;
    newSize: string;
  } | null>(null);

  const uploadFile = async (
    file: File,
    type: "profile" | "blog" = "blog",
    postId?: string
  ): Promise<string | null> => {
    try {
      setIsUploading(true);
      setError(null);
      setCompressionInfo(null);

      const result = await storageService.uploadImage(file, type, postId);

      setCompressionInfo({
        wasCompressed: result.wasCompressed,
        originalSize: result.originalSize,
        newSize: result.newSize,
      });

      return result.url;
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (fileUrl: string): Promise<boolean> => {
    try {
      setError(null);
      return await storageService.deleteImage(fileUrl);
    } catch (err: any) {
      setError(err.message || "Failed to delete file");
      return false;
    }
  };
  return {
    uploadFile,
    deleteFile,
    isUploading,
    error,
    compressionInfo,
  };
}

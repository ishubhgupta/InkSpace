"use client";

import { useState } from "react";
import { storageService } from "@/lib/supabase/storage";

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setError(null);

      const fileUrl = await storageService.uploadImage(file);

      return fileUrl;
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
  };
}

"use client";

import { createClient } from "@/lib/supabase/client";
import { ImageCompressor } from "@/lib/utils/imageCompressor";

export class SupabaseStorageService {
  private supabase = createClient();
  private bucket = "images";

  async uploadImage(
    file: File,
    type: "profile" | "blog" = "blog",
    postId?: string
  ): Promise<{
    url: string;
    wasCompressed: boolean;
    originalSize: string;
    newSize: string;
  }> {
    try {
      // Count existing images for blog posts
      let currentImageCount = 0;
      if (type === "blog" && postId) {
        currentImageCount = await this.countBlogImages(postId);
      }

      // Validate and compress image
      const {
        file: processedFile,
        wasCompressed,
        originalSize,
        newSize,
      } = await ImageCompressor.validateAndCompressImage(
        file,
        type,
        currentImageCount
      );

      // Generate unique filename with type prefix
      const fileExt = processedFile.name.split(".").pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const prefix = type === "profile" ? "profile" : "blog";
      const fileName = `${prefix}_${timestamp}_${randomId}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(filePath, processedFile, {
          cacheControl: "3600",
          upsert: false,
          metadata: {
            type,
            postId: postId || "",
            originalSize,
            compressedSize: newSize,
            wasCompressed: wasCompressed.toString(),
          },
        });

      if (error) {
        console.error("Upload error:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = this.supabase.storage.from(this.bucket).getPublicUrl(filePath);

      return {
        url: publicUrl,
        wasCompressed,
        originalSize,
        newSize,
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  async countBlogImages(postId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .list("uploads", {
          limit: 100,
          search: `blog_`,
        });

      if (error) throw error;

      // Filter by postId in metadata
      let count = 0;
      if (data) {
        for (const file of data) {
          // Supabase Storage API does not support getMetadata; check postId in file metadata if available
          if (file.metadata?.postId === postId) {
            count++;
          }
        }
      }

      return count;
    } catch (error) {
      console.error("Error counting blog images:", error);
      return 0;
    }
  }

  async deleteImage(url: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = url.split("/");
      const bucket = urlParts[urlParts.length - 3];
      const folder = urlParts[urlParts.length - 2];
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${folder}/${fileName}`;

      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error("Delete error:", error);
        throw new Error(`Delete failed: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error("Error deleting image:", error);
      return false;
    }
  }

  async listImages(type?: "profile" | "blog"): Promise<string[]> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .list("uploads");

      if (error) throw error;

      let filteredFiles = data || [];

      if (type) {
        filteredFiles =
          data?.filter((file) => file.name.startsWith(`${type}_`)) || [];
      }

      return filteredFiles.map((file) => {
        const {
          data: { publicUrl },
        } = this.supabase.storage
          .from(this.bucket)
          .getPublicUrl(`uploads/${file.name}`);
        return publicUrl;
      });
    } catch (error) {
      console.error("Error listing images:", error);
      return [];
    }
  }
}

export const storageService = new SupabaseStorageService();

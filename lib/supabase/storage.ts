"use client";

import { createClient } from "@/lib/supabase/client";

export class SupabaseStorageService {
  private supabase = createClient();
  private bucket = "images";

  async uploadImage(file: File): Promise<string> {
    try {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB");
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPEG, PNG, GIF, and WebP images are allowed");
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = this.supabase.storage.from(this.bucket).getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
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

  async listImages(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .list("uploads");

      if (error) throw error;

      return (
        data?.map((file) => {
          const {
            data: { publicUrl },
          } = this.supabase.storage
            .from(this.bucket)
            .getPublicUrl(`uploads/${file.name}`);
          return publicUrl;
        }) || []
      );
    } catch (error) {
      console.error("Error listing images:", error);
      return [];
    }
  }
}

export const storageService = new SupabaseStorageService();

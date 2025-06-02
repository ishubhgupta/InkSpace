"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFileUpload } from "@/lib/hooks/useFileUploadEnhanced";
import { toast } from "@/hooks/use-toast";
import { Camera, Loader2, Upload } from "lucide-react";

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  userName?: string;
  size?: "sm" | "md" | "lg";
  showUploadButton?: boolean;
}

export default function ProfileImageUpload({
  currentImageUrl,
  onImageChange,
  userName = "User",
  size = "md",
  showUploadButton = true,
}: ProfileImageUploadProps) {
  const { uploadFile, isUploading, compressionInfo } = useFileUpload();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  const handleImageUpload = async (file: File) => {
    try {
      toast({
        title: "Uploading profile image...",
        description: "Compressing and uploading your profile picture...",
      });

      const url = await uploadFile(file, "profile");
      if (url) {
        setPreviewUrl(url);
        onImageChange(url);

        // Show compression feedback
        if (compressionInfo?.wasCompressed) {
          toast({
            title: "Profile image updated!",
            description: `Image compressed from ${compressionInfo.originalSize} to ${compressionInfo.newSize} and uploaded successfully.`,
          });
        } else {
          toast({
            title: "Profile image updated!",
            description: "Your profile picture has been updated successfully.",
          });
        }
      }
    } catch (error) {
      console.error("Failed to upload profile image:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const triggerFileInput = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await handleImageUpload(file);
      }
    };
    input.click();
  };

  const displayUrl = previewUrl || currentImageUrl;
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={displayUrl} alt={userName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        {/* Overlay on hover for interactive upload */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={triggerFileInput}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 text-white animate-spin" />
          ) : (
            <Camera className="h-4 w-4 text-white" />
          )}
        </div>
      </div>

      {showUploadButton && (
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerFileInput}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading ? "Uploading..." : "Change Photo"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Max 50KB. Images will be auto-compressed.
          </p>
        </div>
      )}
    </div>
  );
}

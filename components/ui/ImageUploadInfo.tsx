"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Info,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

interface ImageUploadInfoProps {
  type: "profile" | "blog";
  currentImageCount?: number;
  maxImages?: number;
  compressionInfo?: {
    wasCompressed: boolean;
    originalSize: string;
    newSize: string;
  } | null;
  isUploading?: boolean;
  uploadProgress?: number;
}

export default function ImageUploadInfo({
  type,
  currentImageCount = 0,
  maxImages = 2,
  compressionInfo,
  isUploading = false,
  uploadProgress = 0,
}: ImageUploadInfoProps) {
  const maxSizeKB = type === "profile" ? 50 : 100;
  const maxDimensions = type === "profile" ? "400x400px" : "1920x1080px";
  const showImageCount = type === "blog";

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ImageIcon className="h-4 w-4" />
          {type === "profile" ? "Profile Image" : "Blog Images"} Upload Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Compression Result */}
        {compressionInfo && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {compressionInfo.wasCompressed
                    ? "Image Compressed Successfully"
                    : "Image Uploaded Successfully"}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {compressionInfo.wasCompressed
                    ? `Size reduced from ${compressionInfo.originalSize} to ${compressionInfo.newSize}`
                    : `Original size: ${compressionInfo.originalSize} (no compression needed)`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Image Count (for blog) */}
        {showImageCount && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Images in post:
            </span>
            <Badge
              variant={
                currentImageCount >= maxImages ? "destructive" : "secondary"
              }
              className="text-xs"
            >
              {currentImageCount} / {maxImages}
            </Badge>
          </div>
        )}

        {/* Upload Limits */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>Upload Limits</span>
          </div>
          <div className="pl-5 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Max file size:</span>
              <span>{maxSizeKB}KB</span>
            </div>
            <div className="flex justify-between">
              <span>Max dimensions:</span>
              <span>{maxDimensions}</span>
            </div>
            {showImageCount && (
              <div className="flex justify-between">
                <span>Max images per post:</span>
                <span>{maxImages}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Supported formats:</span>
              <span>JPEG, PNG, GIF, WebP</span>
            </div>
          </div>
        </div>

        {/* Warning for max images reached */}
        {showImageCount && currentImageCount >= maxImages && (
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Maximum images reached
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  You've reached the maximum of {maxImages} images per blog
                  post. Remove an existing image to add a new one.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Auto-compression note */}
        <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Auto-compression:</strong> Images larger than {maxSizeKB}KB
            will be automatically compressed to meet size requirements while
            maintaining quality.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

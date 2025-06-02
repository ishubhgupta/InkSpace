export interface ImageCompressionOptions {
  maxSizeKB: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export class ImageCompressor {
  static async compressImage(
    file: File,
    options: ImageCompressionOptions
  ): Promise<File> {
    const {
      maxSizeKB,
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1080,
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            const currentSizeKB = blob.size / 1024;

            if (currentSizeKB <= maxSizeKB) {
              // Size is acceptable
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              // Need more aggressive compression
              const newQuality = Math.max(
                0.1,
                quality * (maxSizeKB / currentSizeKB)
              );

              canvas.toBlob(
                (finalBlob) => {
                  if (!finalBlob) {
                    reject(
                      new Error("Failed to compress image to target size")
                    );
                    return;
                  }

                  const finalFile = new File([finalBlob], file.name, {
                    type: file.type,
                    lastModified: Date.now(),
                  });
                  resolve(finalFile);
                },
                file.type,
                newQuality
              );
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  static async validateAndCompressImage(
    file: File,
    type: "profile" | "blog",
    currentImageCount = 0
  ): Promise<{
    file: File;
    wasCompressed: boolean;
    originalSize: string;
    newSize: string;
  }> {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPEG, PNG, GIF, and WebP images are allowed");
    }

    // Check blog image limit
    if (type === "blog" && currentImageCount >= 2) {
      throw new Error("Maximum 2 images allowed per blog post");
    }

    const originalSize = ImageCompressor.formatFileSize(file.size);
    const targetSizeKB = type === "profile" ? 50 : 100;
    const currentSizeKB = file.size / 1024;

    if (currentSizeKB <= targetSizeKB) {
      // File is already small enough
      return {
        file,
        wasCompressed: false,
        originalSize,
        newSize: originalSize,
      };
    }

    // Compress the image
    const compressionOptions: ImageCompressionOptions = {
      maxSizeKB: targetSizeKB,
      quality: type === "profile" ? 0.7 : 0.8,
      maxWidth: type === "profile" ? 400 : 1920,
      maxHeight: type === "profile" ? 400 : 1080,
    };

    const compressedFile = await ImageCompressor.compressImage(
      file,
      compressionOptions
    );
    const newSize = ImageCompressor.formatFileSize(compressedFile.size);

    return {
      file: compressedFile,
      wasCompressed: true,
      originalSize,
      newSize,
    };
  }
}

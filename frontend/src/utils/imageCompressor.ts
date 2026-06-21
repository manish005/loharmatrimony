/**
 * Utility to compress images client-side before uploading to storage.
 * Uses HTML5 Canvas for resizing and re-encoding.
 */
export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
}

export const compressImage = (
  file: File,
  quality: number = 0.7,
  maxDimension: number = 1200
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image."));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // Setup Canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get 2D context from canvas."));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas drawing to compressed Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas export to blob failed."));
              return;
            }

            const originalSize = file.size;
            const compressedSize = blob.size;
            const savingsPercent = Math.round(((originalSize - compressedSize) / originalSize) * 100);

            resolve({
              blob,
              originalSize,
              compressedSize,
              savingsPercent
            });
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image."));
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file."));
    };
  });
};

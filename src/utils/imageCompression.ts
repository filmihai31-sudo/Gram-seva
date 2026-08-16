/**
 * Client-side high-performance image compression using HTML5 Canvas
 * Compresses 5MB - 10MB camera uploads down to ~150KB - 300KB
 * while maintaining crisp resolution for avatars and shop cards.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  percentSaved: number;
}

export const compressImageFile = (
  file: File,
  maxDimension = 1000,
  quality = 0.75
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          const raw = readerEvent.target?.result as string;
          resolve({
            dataUrl: raw,
            originalSizeKb,
            compressedSizeKb: originalSizeKb,
            percentSaved: 0
          });
          return;
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Estimate size in KB
        const head = 'data:image/jpeg;base64,';
        const base64Length = dataUrl.startsWith(head) ? dataUrl.length - head.length : dataUrl.length;
        const compressedSizeKb = Math.max(1, Math.round((base64Length * 0.75) / 1024));
        const percentSaved = Math.max(0, Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100));

        resolve({
          dataUrl,
          originalSizeKb,
          compressedSizeKb,
          percentSaved
        });
      };

      img.onerror = (err) => reject(err);
      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

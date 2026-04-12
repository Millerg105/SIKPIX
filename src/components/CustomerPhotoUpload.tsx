import { useState, useCallback } from "react";
import { Upload, X, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
  signedUrl?: string;
  storagePath?: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

interface CustomerPhotoUploadProps {
  photos: UploadedPhoto[];
  onPhotosChange: (photos: UploadedPhoto[]) => void;
  maxPhotos?: number;
  maxSizeBytes?: number;
  disabled?: boolean;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function CustomerPhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 4,
  maxSizeBytes = 20 * 1024 * 1024,
  disabled = false,
}: CustomerPhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    const newPhotos: UploadedPhoto[] = [];
    const errors: string[] = [];

    Array.from(files).slice(0, remainingSlots).forEach(file => {
      // Validate type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        errors.push(`${file.name}: Invalid format (JPG, PNG, WEBP only)`);
        return;
      }

      // Validate size
      if (file.size > maxSizeBytes) {
        errors.push(`${file.name}: Too large (max ${Math.round(maxSizeBytes / 1024 / 1024)}MB)`);
        return;
      }

      newPhotos.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
        uploaded: false,
      });
    });

    if (errors.length > 0) {
      toast.error(errors.join('\n'));
    }

    if (newPhotos.length > 0) {
      onPhotosChange([...photos, ...newPhotos]);
    }
  }, [photos, onPhotosChange, maxPhotos, maxSizeBytes]);

  const removePhoto = useCallback((id: string) => {
    const photo = photos.find(p => p.id === id);
    if (photo) {
      URL.revokeObjectURL(photo.preview);
    }
    onPhotosChange(photos.filter(p => p.id !== id));
  }, [photos, onPhotosChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`rounded border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border/50 hover:border-primary/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <input
            type="file"
            id="customer-photo-upload"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
          <label
            htmlFor="customer-photo-upload"
            className={disabled ? "cursor-not-allowed" : "cursor-pointer"}
          >
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="font-body text-foreground">
                Drop photos here or click to browse
              </p>
              <p className="font-body text-sm text-muted-foreground">
                JPG, PNG, WEBP up to 20MB each • {photos.length}/{maxPhotos} uploaded
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded border border-border bg-charcoal"
            >
              <img
                src={photo.preview}
                alt="Customer upload"
                className="h-full w-full object-cover"
              />
              
              {/* Status overlay */}
              {photo.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              
              {photo.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/80">
                  <AlertCircle className="h-6 w-6 text-destructive-foreground" />
                </div>
              )}
              
              {photo.uploaded && (
                <div className="absolute bottom-1 left-1 rounded bg-primary/90 px-1.5 py-0.5">
                  <span className="text-xs font-medium text-primary-foreground">✓</span>
                </div>
              )}

              {/* Remove button */}
              {!photo.uploading && !disabled && (
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute right-1 top-1 rounded-full bg-background/80 p-1 opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="rounded bg-charcoal p-4">
        <p className="font-body text-xs font-medium text-primary mb-2">Upload Tips:</p>
        <ul className="space-y-1">
          <li className="font-body text-xs text-muted-foreground">• Side profile or 3/4 angle works best</li>
          <li className="font-body text-xs text-muted-foreground">• Shoot in good daylight if possible</li>
          <li className="font-body text-xs text-muted-foreground">• Clean background helps, like a car park or open road</li>
          <li className="font-body text-xs text-muted-foreground">• Show the full car, no cropped bumpers</li>
        </ul>
      </div>
    </div>
  );
}

// Upload function to call edge function
export async function uploadCustomerPhotos(
  photos: UploadedPhoto[],
  sessionId: string,
  onProgress: (photos: UploadedPhoto[]) => void
): Promise<string[]> {
  const uploadedUrls: string[] = [];
  const updatedPhotos = [...photos];

  for (let i = 0; i < updatedPhotos.length; i++) {
    const photo = updatedPhotos[i];
    
    // Skip already uploaded
    if (photo.uploaded && photo.signedUrl) {
      uploadedUrls.push(photo.signedUrl);
      continue;
    }

    // Mark as uploading
    updatedPhotos[i] = { ...photo, uploading: true, error: undefined };
    onProgress([...updatedPhotos]);

    try {
      const formData = new FormData();
      formData.append('file', photo.file);
      formData.append('sessionId', sessionId);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/upload-customer-photo`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.signedUrl) {
        throw new Error(data.error || 'No URL returned');
      }

      updatedPhotos[i] = {
        ...updatedPhotos[i],
        uploading: false,
        uploaded: true,
        signedUrl: data.signedUrl,
        storagePath: data.storagePath,
      };
      uploadedUrls.push(data.signedUrl);
    } catch (error) {
      updatedPhotos[i] = {
        ...updatedPhotos[i],
        uploading: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }

    onProgress([...updatedPhotos]);
  }

  // Check for any failures
  const failedUploads = updatedPhotos.filter(p => p.error);
  if (failedUploads.length > 0) {
    throw new Error(`${failedUploads.length} photo(s) failed to upload`);
  }

  return uploadedUrls;
}

export type { UploadedPhoto };

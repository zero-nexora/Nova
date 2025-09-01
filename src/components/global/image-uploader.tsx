"use client";

import { useRef } from "react";
import { Upload, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploaderProps } from "@/queries/admin/uploads/types";
import { useImageUploader } from "@/app/(admin)/admin/categories/hooks/custom-hook";
import {
  LocalImagePreviewCard,
  UploadedImagePreviewCard,
} from "./image-preview";

export const ImageUploader = ({
  value = [],
  onChange,
  maxFiles = 5,
  folder,
  disabled = false,
  multiple = true,
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    localPreviews,
    isUploading,
    canAddMoreFiles,
    addFilesToPreview,
    removePreview,
    clearAllPreviews,
    uploadImages,
    deleteImage,
  } = useImageUploader(maxFiles, folder, onChange);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFilesToPreview(event.target.files);
    // Reset input to allow selecting same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteUploadedImage = (publicId: string) => {
    deleteImage(publicId, value);
  };

  const hasLocalPreviews = localPreviews.length > 0;
  const hasUploadedImages = value.length > 0;
  const selectButtonText = multiple ? "Select Images" : "Select Image";

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={openFileDialog}
          disabled={disabled || !canAddMoreFiles}
          className="gap-2"
        >
          <ImagePlus className="h-4 w-4" />
          {selectButtonText}
        </Button>

        {hasLocalPreviews && (
          <>
            <Button
              type="button"
              onClick={uploadImages}
              disabled={disabled || isUploading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Images"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={clearAllPreviews}
              disabled={disabled}
            >
              Clear Previews
            </Button>
          </>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelection}
        className="hidden"
        disabled={disabled}
      />

      {/* File Count Info */}
      <div className="text-sm text-muted-foreground">
        {hasLocalPreviews && <p>Ready to upload: {localPreviews.length}</p>}
        {hasUploadedImages && (
          <p>
            Uploaded: {value.length}/{maxFiles}
          </p>
        )}
        {!hasLocalPreviews && !hasUploadedImages && (
          <p>No images selected (max: {maxFiles})</p>
        )}
      </div>

      {/* Local Previews Grid */}
      {hasLocalPreviews && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Previews</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {localPreviews.map((preview) => (
              <LocalImagePreviewCard
                key={preview.id}
                preview={preview}
                onRemove={removePreview}
              />
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Images Grid */}
      {hasUploadedImages && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Uploaded Images</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {value.map((image) => (
              <UploadedImagePreviewCard
                key={image.publicId}
                image={image}
                onDelete={handleDeleteUploadedImage}
                isDeleting={isUploading}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

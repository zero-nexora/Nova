"use client";

import { useEffect, useRef } from "react";
import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalImagePreviewCard } from "./image-preview";
import { useImageUploader } from "@/app/(admin)/admin/categories/hooks/custom-hook";
import { MAX_FILE_CATEGORY, MAX_FILES } from "@/lib/constants";
import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";

// Main ImageUploader Component
export interface ImageUploaderProps {
  disabled?: boolean;
  multiple?: boolean;
  setImageUploader: (imagesUpload: LocalImagePreview[]) => void;
}

export const ImageUploader = ({
  disabled = false,
  multiple = false,
  setImageUploader,
}: ImageUploaderProps) => {
  const maxFiles = multiple ? MAX_FILES : MAX_FILE_CATEGORY;
  const {
    localPreviews,
    addFilesToPreview,
    clearAllPreviews,
    canAddMoreFiles,
    removePreview,
  } = useImageUploader(maxFiles);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasLocalPreviews = localPreviews.length > 0;

  const defaultButtonText = multiple
    ? `Select Images (${localPreviews.length}/${maxFiles})`
    : localPreviews.length > 0
    ? "Change Image"
    : "Select Image";

  const openFileDialog = () => {
    if (disabled || !canAddMoreFiles) return;
    fileInputRef.current?.click();
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFilesToPreview(event.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    setImageUploader(localPreviews);
  }, [localPreviews]);

  return (
    <div className={`space-y-4`}>
      {hasLocalPreviews && (
        <div className="relative">
          <div className="flex flex-wrap gap-3 border p-2 rounded-md">
            {localPreviews.map((preview) => (
              <LocalImagePreviewCard
                key={preview.id}
                preview={preview}
                onRemove={removePreview}
              />
            ))}
          </div>

          {localPreviews.length > 1 && (
            <button
              type="button"
              onClick={clearAllPreviews}
              className="absolute top-0 right-0 bg-muted hover:bg-muted/90 text-white text-xs p-1.5  rounded-md transition-colors shadow-sm -translate-y-[100%] rounded-bl-none rounded-br-none"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* File Input */}
      <input
        type="file"
        hidden
        ref={fileInputRef}
        onChange={handleFileSelection}
        multiple={multiple}
        accept="image/*"
        disabled={disabled}
      />

      {/* Upload Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 border-dashed border-2 hover:border-solid hover:bg-primary/5"
        onClick={openFileDialog}
        disabled={disabled || !canAddMoreFiles}
      >
        <UploadIcon className="w-5 h-5 mr-2" />
        {defaultButtonText}
      </Button>

      {/* Info Text */}
      {maxFiles > 1 && (
        <p className="text-sm text-gray-500 text-center">
          You can upload up to {maxFiles} files.{" "}
          {canAddMoreFiles
            ? `${maxFiles - localPreviews.length} slots remaining.`
            : "Maximum reached."}
        </p>
      )}
    </div>
  );
};

export default ImageUploader;

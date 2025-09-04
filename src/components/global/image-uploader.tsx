"use client";

import { useEffect, useRef } from "react";
import { UploadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ImagesPreview } from "./images-preview";
import { useImageUploader } from "@/app/(admin)/admin/categories/hooks/custom-hook";
import { MAX_FILE_CATEGORY, MAX_FILES } from "@/lib/constants";
import {
  LocalImagePreview,
  mapPreviewList,
} from "@/app/(admin)/admin/categories/hooks/types";

export interface ImageUploaderProps {
  disabled?: boolean;
  multiple?: boolean;
  onImagesChange: (images: LocalImagePreview[]) => void;
}

export const ImageUploader = ({
  disabled = false,
  multiple = false,
  onImagesChange,
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFiles = multiple ? MAX_FILES : MAX_FILE_CATEGORY;

  const {
    localPreviews,
    addFilesToPreview,
    removePreview,
    clearAllPreviews,
    canAddMoreFiles,
  } = useImageUploader(maxFiles);

  const hasImages = localPreviews.length > 0;
  const showClearAllButton = localPreviews.length > 1;

  const getButtonText = () => {
    if (multiple) {
      return `Select Images (${localPreviews.length}/${maxFiles})`;
    }
    return hasImages ? "Change Image" : "Select Image";
  };

  const getInfoText = () => {
    if (!multiple || maxFiles <= 1) return null;

    const remaining = maxFiles - localPreviews.length;
    const status = canAddMoreFiles
      ? `${remaining} slots remaining.`
      : "Maximum reached.";

    return `You can upload up to ${maxFiles} files. ${status}`;
  };

  const handleFileDialogOpen = () => {
    if (disabled || !canAddMoreFiles) return;
    fileInputRef.current?.click();
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      addFilesToPreview(files);
      event.target.value = "";
    }
  };

  const handleRemoveImage = (previewId: string) => {
    removePreview(previewId);
  };

  const handleClearAll = () => {
    clearAllPreviews();
  };

  useEffect(() => {
    onImagesChange(localPreviews);
  }, [localPreviews, onImagesChange]);

  return (
    <div className="space-y-4">
      {hasImages && (
        <ImagesPreview
          onRemove={handleRemoveImage}
          disabled={disabled}
          onClearAll={handleClearAll}
          previewList={mapPreviewList(localPreviews)}
          showClearAllButton={showClearAllButton}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple={multiple}
        accept="image/*"
        disabled={disabled}
        onChange={handleFileSelection}
      />

      <Button
        type="button"
        variant="outline"
        onClick={handleFileDialogOpen}
        disabled={disabled || !canAddMoreFiles}
        className="w-full h-12 border-dashed border-2 hover:border-solid hover:bg-primary/5"
      >
        <UploadIcon className="w-5 h-5 mr-2" />
        {getButtonText()}
      </Button>

      {getInfoText() && (
        <p className="text-sm text-gray-500 text-center">{getInfoText()}</p>
      )}
    </div>
  );
};

export default ImageUploader;

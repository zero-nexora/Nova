import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useCallback, useState } from "react";
import { MAX_FILE_CATEGORY } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import { convertFileToBase64, generateUniqueId } from "@/lib/utils";
import type { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";

export const useImageUploader = (maxFiles: number = MAX_FILE_CATEGORY) => {
  const [localPreviews, setLocalPreviews] = useState<LocalImagePreview[]>([]);

  const availableSlots = Math.max(0, maxFiles - localPreviews.length);

  const addFilesToPreview = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) {
        return;
      }

      try {
        const files = Array.from(fileList).slice(0, availableSlots);

        if (files.length === 0) {
          toast.warning("Maximum file limit reached");
          return;
        }

        const newPreviews = await Promise.all(
          files.map(async (file) => {
            if (!file.type.startsWith("image/")) {
              throw new Error(`Invalid file type: ${file.name}`);
            }

            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
              throw new Error(`File too large: ${file.name}`);
            }

            return {
              id: generateUniqueId(),
              base64Url: await convertFileToBase64(file),
            };
          })
        );

        setLocalPreviews((currentPreviews) => [
          ...currentPreviews,
          ...newPreviews,
        ]);

        const message =
          files.length === 1
            ? "Image added successfully"
            : `${files.length} images added successfully`;
        toast.success(message);
      } catch (error) {
        console.error("File processing error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Error processing files";
        toast.error(errorMessage);
      }
    },
    [availableSlots]
  );

  const removePreview = useCallback((previewId: string) => {
    setLocalPreviews((currentPreviews) =>
      currentPreviews.filter((preview) => preview.id !== previewId)
    );
    toast.success("Image removed");
  }, []);

  const clearAllPreviews = useCallback(() => {
    setLocalPreviews([]);
    toast.success("All images cleared");
  }, []);

  const resetUploader = useCallback(() => {
    setLocalPreviews([]);
  }, []);

  return {
    localPreviews,
    canAddMoreFiles: localPreviews.length < maxFiles,

    addFilesToPreview,
    removePreview,
    clearAllPreviews,
    resetUploader,

    hasImages: localPreviews.length > 0,
    imageCount: localPreviews.length,
    remainingSlots: availableSlots,
  };
};

export function useUploadImage() {
  const trpc = useTRPC();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.upload.uploadImage.mutationOptions({
      onSuccess: () => {
        toast.success("Image uploaded successfully");
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useUploadImage ", error.message);
      },
    })
  );

  return {
    uploadImage: mutate,
    uploadImageAsync: mutateAsync,
    isPending,
    error,
  };
}

export function useUploadImages() {
  const trpc = useTRPC();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.upload.uploadImages.mutationOptions({
      onSuccess: (data) => {
        toast.success(`${data.data.length} Images uploaded successfully`);
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useUploadImages ", error.message);
      },
    })
  );

  return {
    uploadImages: mutate,
    uploadImagesAsync: mutateAsync,
    isPending,
    error,
  };
}

export function useDeleteImage() {
  const trpc = useTRPC();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.upload.deleteImage.mutationOptions({
      onSuccess: () => {
        toast.success("Image deleted successfully");
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useDeleteImage ", error.message);
      },
    })
  );

  return {
    deleteImageAsync: mutateAsync,
    deleteImage: mutate,
    isPending,
    error,
  };
}

export function useDeleteImages() {
  const trpc = useTRPC();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.upload.deleteImages.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          `${data.successful} image deleted successfully and ${data.failed} image(s) deleted failed`
        );
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useDeleteImages ", error.message);
      },
    })
  );

  return {
    deleteImagesAsync: mutateAsync,
    deleteImages: mutate,
    isPending,
    error,
  };
}

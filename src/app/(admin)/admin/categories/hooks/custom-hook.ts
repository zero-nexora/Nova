"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { convertFileToBase64, generateUniqueId } from "@/lib/utils";
import { useCategoriesStore } from "@/stores/admin/categories-store";
import { LocalImagePreview } from "./types";
import { MAX_FILE_CATEGORY } from "@/lib/constants";

export interface CreateCategoryInput {
  name: string;
  parent_id?: string;
  image_url?: string;
  public_id?: string;
}

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  parent_id?: string;
  image_url?: string;
  public_id?: string;
}

export interface DeleteCategoryInput {
  id: string;
  hard_delete?: boolean;
}

export interface CategoryOption {
  value: string;
  label: string;
  parentId?: string | null;
  isChild: boolean;
}

export interface CategoryStats {
  totalProducts?: number;
  totalChildren?: number;
  totalCategories?: number;
  totalParentCategories?: number;
  totalChildCategories?: number;
}

// ==================== Query Keys & Utils ====================
const getCategoryQueryKeys = (trpc: ReturnType<typeof useTRPC>) => ({
  all: () => trpc.categoriesAdmin.getAll.queryOptions(),
  byId: (id: string) => trpc.categoriesAdmin.getById.queryOptions({ id }),
  bySlug: (slug: string) =>
    trpc.categoriesAdmin.getBySlug.queryOptions({ slug }),
});

// ==================== Query Hooks ====================
export function useGetAllCategories() {
  const trpc = useTRPC();
  const setCategories = useCategoriesStore((state) => state.setCategories);
  const setLoading = useCategoriesStore((state) => state.setLoading);

  const { data, isFetching } = useQuery(
    trpc.categoriesAdmin.getAll.queryOptions()
  );

  useEffect(() => {
    if (data?.data) {
      setCategories(data.data);
    }
  }, [data?.data]);

  useEffect(() => {
    setLoading(isFetching);
  }, [isFetching]);

  return {
    categories: data?.data ?? [],
    isFetching,
  };
}

export function useGetCategoryById(id: string, enabled = true) {
  const trpc = useTRPC();

  const query = useQuery({
    ...trpc.categoriesAdmin.getById.queryOptions({ id }),
    enabled: enabled && !!id,
  });

  return {
    category: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useGetCategoryBySlug(slug: string, enabled = true) {
  const trpc = useTRPC();

  const query = useQuery({
    ...trpc.categoriesAdmin.getBySlug.queryOptions({ slug }),
    enabled: enabled && !!slug,
  });

  return {
    category: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ==================== Mutation Hooks ====================
export function useCreateCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.categoriesAdmin.create.mutationOptions(),
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create category");
    },
  });

  return {
    createCategory: mutation.mutate,
    createCategoryAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useUpdateCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.categoriesAdmin.update.mutationOptions(),
    onSuccess: (data) => {
      toast.success("Category updated successfully");

      // Invalidate related queries
      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).byId(data.id));

      if (data.slug) {
        queryClient.invalidateQueries(
          getCategoryQueryKeys(trpc).bySlug(data.slug)
        );
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update category");
    },
  });

  return {
    updateCategory: mutation.mutate,
    updateCategoryAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

export function useDeleteCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.categoriesAdmin.delete.mutationOptions(),
    onSuccess: (_, variables) => {
      const message = variables.hard_delete
        ? "Category permanently deleted"
        : "Category moved to trash";
      toast.success(message);

      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "categoriesAdmin.getById" ||
          query.queryKey[0] === "categoriesAdmin.getBySlug",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete category");
    },
  });

  return {
    deleteCategory: mutation.mutate,
    deleteCategoryAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useRestoreCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.categoriesAdmin.restore.mutationOptions(),
    onSuccess: (data) => {
      toast.success("Category restored successfully");

      // Invalidate related queries
      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).byId(data.id));

      if (data.slug) {
        queryClient.invalidateQueries(
          getCategoryQueryKeys(trpc).bySlug(data.slug)
        );
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to restore category");
    },
  });

  return {
    restoreCategory: mutation.mutate,
    restoreCategoryAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

export const useImageUploader = (maxFiles: number = MAX_FILE_CATEGORY) => {
  const trpc = useTRPC();
  const [localPreviews, setLocalPreviews] = useState<LocalImagePreview[]>([]);

  const uploadMutation = useMutation(
    trpc.upload.uploadImages.mutationOptions({})
  );

  const isUploading = uploadMutation.isPending;
  const canAddMoreFiles = localPreviews.length < maxFiles;

  const addFilesToPreview = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList) return;

      const files = Array.from(fileList);
      const availableSlots = Math.max(0, maxFiles - localPreviews.length);
      const filesToProcess = files.slice(0, availableSlots);

      try {
        const newPreviews = await Promise.all(
          filesToProcess.map(async (file) => ({
            id: generateUniqueId(),
            base64Url: await convertFileToBase64(file),
          }))
        );

        setLocalPreviews((current) => [...current, ...newPreviews]);
      } catch (error) {
        toast.error("Error processing files");
        console.error("File processing error:", error);
      }
    },
    [localPreviews.length, maxFiles]
  );

  const removePreview = useCallback((previewId: string) => {
    setLocalPreviews((current) =>
      current.filter((preview) => preview.id !== previewId)
    );
  }, []);

  const clearAllPreviews = useCallback(() => {
    setLocalPreviews([]);
  }, []);

  // Reset hook state
  const resetUploader = useCallback(() => {
    setLocalPreviews([]);
  }, []);

  return {
    localPreviews,
    isUploading,
    canAddMoreFiles,
    addFilesToPreview,
    removePreview,
    clearAllPreviews,
    resetUploader,
  };
};

export function useUploadImages() {
  const trpc = useTRPC();

  const mutation = useMutation({
    ...trpc.upload.uploadImages.mutationOptions(),
    onSuccess: () => {
      toast.success("Images uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload images");
    },
  });

  return {
    uploadImages: mutation.mutate,
    uploadImagesAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useRemoveImages() {
  const trpc = useTRPC();

  const mutation = useMutation({
    ...trpc.upload.removeImages.mutationOptions(),
    onSuccess: () => {
      toast.success("Images removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove images");
    },
  });

  return {
    removeImages: mutation.mutate,
    removeImagesAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

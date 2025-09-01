"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import {
  LocalImagePreview,
  UploadedImage,
} from "@/queries/admin/uploads/types";
import { convertFileToBase64, generateUniqueId } from "@/lib/utils";
import { useCategoriesStore } from "@/stores/admin/categories-store";

// ==================== Types ====================
export interface GetAllCategoriesInput {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

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
  all: () => trpc.categoriesAdmin.getAll.queryOptions({}),
  byId: (id: string) => trpc.categoriesAdmin.getById.queryOptions({ id }),
  bySlug: (slug: string) =>
    trpc.categoriesAdmin.getBySlug.queryOptions({ slug }),
});

// ==================== Query Hooks ====================
export function useGetAllCategories(input: GetAllCategoriesInput = {}) {
  const trpc = useTRPC();
  const setCategories = useCategoriesStore((state) => state.setCategories);

  const query = useQuery(trpc.categoriesAdmin.getAll.queryOptions(input));

  useEffect(() => {
    if (query.data?.data) {
      setCategories(query.data.data, query.data?.pagination);
    }
  }, [query.data?.data, query.data?.pagination]);

  return {
    categories: query.data?.data ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
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
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
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

      // Invalidate all categories queries
      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
      // Invalidate all individual category queries
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
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
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

// ==================== Composite Hooks ====================
export function useCategoryManagement() {
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const restore = useRestoreCategory();

  const isAnyLoading = useMemo(() => {
    return (
      create.isLoading ||
      update.isLoading ||
      deleteCategory.isLoading ||
      restore.isLoading
    );
  }, [
    create.isLoading,
    update.isLoading,
    deleteCategory.isLoading,
    restore.isLoading,
  ]);

  const resetAll = () => {
    create.reset();
    update.reset();
    deleteCategory.reset();
    restore.reset();
  };

  return {
    // Create operations
    createCategory: create.createCategory,
    createCategoryAsync: create.createCategoryAsync,
    isCreating: create.isLoading,

    // Update operations
    updateCategory: update.updateCategory,
    updateCategoryAsync: update.updateCategoryAsync,
    isUpdating: update.isLoading,

    // Delete operations
    deleteCategory: deleteCategory.deleteCategory,
    deleteCategoryAsync: deleteCategory.deleteCategoryAsync,
    isDeleting: deleteCategory.isLoading,

    // Restore operations
    restoreCategory: restore.restoreCategory,
    restoreCategoryAsync: restore.restoreCategoryAsync,
    isRestoring: restore.isLoading,

    // General state
    isAnyLoading,
    resetAll,
  };
}

// ==================== Utility Hooks ====================
export function useCategoryOptions() {
  const { categories, isLoading } = useGetAllCategories({
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });

  const options: CategoryOption[] = useMemo(() => {
    return categories.map((category) => ({
      value: category.id,
      label: category.parentName
        ? `${category.parentName} > ${category.name}`
        : category.name,
      parentId: category.parentId,
      isChild: !!category.parentId,
    }));
  }, [categories]);

  const parentOptions = useMemo(() => {
    return categories
      .filter((cat) => !cat.parentId)
      .map((category) => ({
        value: category.id,
        label: category.name,
      }));
  }, [categories]);

  const childOptions = useMemo(() => {
    return categories
      .filter((cat) => !!cat.parentId)
      .map((category) => ({
        value: category.id,
        label: category.name,
        parentId: category.parentId,
      }));
  }, [categories]);

  return {
    options,
    parentOptions,
    childOptions,
    isLoading,
  };
}

// export function useCategoryStats(categoryId?: string): CategoryStats {
//   const { categories } = useGetAllCategories();

//   return useMemo(() => {
//     if (categoryId) {
//       const category = categories.find((cat) => cat.id === categoryId);
//       return {
//         totalProducts: category?.productsCount || 0,
//         totalChildren: category?.childrenCount || 0,
//       };
//     }

//     const parentCategories = categories.filter((cat) => !cat.parentId);
//     const childCategories = categories.filter((cat) => cat.parentId);

//     return {
//       totalCategories: categories.length,
//       totalParentCategories: parentCategories.length,
//       totalChildCategories: childCategories.length,
//       totalProducts: categories.reduce((sum, cat) => sum + (cat.productsCount || 0), 0),
//     };
//   }, [categories, categoryId]);
// }

// ==================== Cache Utils ====================
export function useCategoryUtils() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const queryKeys = getCategoryQueryKeys(trpc);

  const invalidateAllCategories = () => {
    queryClient.invalidateQueries(queryKeys.all());
  };

  const invalidateCategoryById = (id: string) => {
    queryClient.invalidateQueries(queryKeys.byId(id));
  };

  const invalidateCategoryBySlug = (slug: string) => {
    queryClient.invalidateQueries(queryKeys.bySlug(slug));
  };

  const refetchAllCategories = () => {
    return queryClient.refetchQueries(queryKeys.all());
  };

  const prefetchCategory = (id: string) => {
    return queryClient.prefetchQuery(queryKeys.byId(id));
  };

  const setCategoryData = (id: string, data: any) => {
    queryClient.setQueryData(queryKeys.byId(id).queryKey, data);
  };

  const getCachedCategory = (id: string) => {
    return queryClient.getQueryData(queryKeys.byId(id).queryKey);
  };

  return {
    invalidateAllCategories,
    invalidateCategoryById,
    invalidateCategoryBySlug,
    refetchAllCategories,
    prefetchCategory,
    setCategoryData,
    getCachedCategory,
  };
}

// ==================== Action Hooks ====================
export function useCategoryActions() {
  const {
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
    isAnyLoading,
  } = useCategoryManagement();

  const handleCreateCategory = async (data: CreateCategoryInput) => {
    try {
      const result = await createCategory(data);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  const handleUpdateCategory = async (data: UpdateCategoryInput) => {
    try {
      const result = await updateCategory(data);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  const handleDeleteCategory = async (id: string, hardDelete = false) => {
    try {
      const result = await deleteCategory({ id, hard_delete: hardDelete });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  const handleRestoreCategory = async (id: string) => {
    try {
      const result = await restoreCategory({ id });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  return {
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleRestoreCategory,
    isLoading: isAnyLoading,
  };
}

export const useImageUploader = (
  maxFiles: number,
  folder?: string,
  onChange?: (images: UploadedImage[]) => void
) => {
  const trpc = useTRPC();
  const [localPreviews, setLocalPreviews] = useState<LocalImagePreview[]>([]);

  const uploadMutation = useMutation(
    trpc.upload.uploadImages.mutationOptions({})
  );

  const deleteMutation = useMutation(
    trpc.upload.deleteImage.mutationOptions({})
  );

  const isUploading = uploadMutation.isPending || deleteMutation.isPending;
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
            file,
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

  const uploadImages = useCallback(async () => {
    if (localPreviews.length === 0) return;

    const uploadPayload = {
      images: localPreviews.map((preview) => ({
        base64: preview.base64Url,
        filename: preview.file.name,
      })),
      folder,
    };

    try {
      const response = await uploadMutation.mutateAsync(uploadPayload);
      const uploadedImages = response.data as UploadedImage[];

      onChange?.(uploadedImages);
      setLocalPreviews([]);
      toast.success(`Successfully uploaded ${uploadedImages.length} images`);
    } catch (error) {
      toast.error("Upload failed. Please try again.");
      console.error("Upload error:", error);
    }
  }, [localPreviews, folder, uploadMutation, onChange]);

  const deleteImage = useCallback(
    async (publicId: string, currentImages: UploadedImage[]) => {
      try {
        const response = await deleteMutation.mutateAsync({
          public_id: publicId,
        });

        if (response.result === "ok") {
          const updatedImages = currentImages.filter(
            (image) => image.publicId !== publicId
          );
          onChange?.(updatedImages);
          toast.success("Image deleted successfully");
        }
      } catch (error) {
        toast.error("Delete failed. Please try again.");
        console.error("Delete error:", error);
      }
    },
    [deleteMutation, onChange]
  );

  return {
    localPreviews,
    isUploading,
    canAddMoreFiles,
    addFilesToPreview,
    removePreview,
    clearAllPreviews,
    uploadImages,
    deleteImage,
  };
};

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { convertFileToBase64, generateUniqueId } from "@/lib/utils";
import { Category, useCategoriesStore } from "@/stores/admin/categories-store";
import { LocalImagePreview } from "./types";
import { MAX_FILE_CATEGORY } from "@/lib/constants";
import { useConfirm } from "@/stores/confirm-store";

export const getCategoryQueryKeys = (trpc: ReturnType<typeof useTRPC>) => ({
  all: () => trpc.admin.categoriesRouter.getAll.queryOptions(),
  byId: (id: string) =>
    trpc.admin.categoriesRouter.getById.queryOptions({ id }),
  bySlug: (slug: string) =>
    trpc.admin.categoriesRouter.getBySlug.queryOptions({ slug }),
});

export function useGetAllCategories() {
  const trpc = useTRPC();
  const setCategories = useCategoriesStore((state) => state.setCategories);
  const setLoading = useCategoriesStore((state) => state.setLoading);

  const { data, isFetching, error } = useQuery(
    trpc.admin.categoriesRouter.getAll.queryOptions()
  );

  useEffect(() => {
    if (data) {
      setCategories(data);
    }
  }, [data]);

  useEffect(() => {
    setLoading(isFetching);
  }, [isFetching]);

  return {
    categories: data,
    error,
    isFetching,
  };
}

export function useGetCategoryById(id: string, enabled = true) {
  const trpc = useTRPC();

  const query = useQuery({
    ...trpc.admin.categoriesRouter.getById.queryOptions({ id }),
    enabled: enabled && !!id,
  });

  return {
    category: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useGetCategoryBySlug(slug: string, enabled = true) {
  const trpc = useTRPC();

  const query = useQuery({
    ...trpc.admin.categoriesRouter.getBySlug.queryOptions({ slug }),
    enabled: enabled && !!slug,
  });

  return {
    category: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.admin.categoriesRouter.create.mutationOptions(),
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
    ...trpc.admin.categoriesRouter.update.mutationOptions(),
    onSuccess: (data) => {
      toast.success("Category updated successfully");

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
    error: mutation.error,
  };
}

export function useDeleteCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.admin.categoriesRouter.delete.mutationOptions(),
    onSuccess: () => {
      toast.dismiss();
      toast.success("Category permanently deleted");

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

export function useToggleDeleted() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.admin.categoriesRouter.toggleDeleted.mutationOptions(),
    onSuccess: (data) => {
      toast.dismiss();
      const message = data.is_deleted
        ? `Category "${data.name}" moved to trash successfully`
        : `Category "${data.name}" restored successfully`;
      toast.success(message);

      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).byId(data.id));

      if (data.slug) {
        queryClient.invalidateQueries(
          getCategoryQueryKeys(trpc).bySlug(data.slug)
        );
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle category");
    },
  });

  return {
    toggleCategory: mutation.mutate,
    toggleCategoryAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

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

            // Validate file size (optional - add your limit)
            const maxSize = 5 * 1024 * 1024; // 5MB
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

type BulkAction = "toggle_deleted" | "delete_permanently" | "";

export const useBulkCategoryActions = (categories: Category[]) => {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [bulkAction, setBulkAction] = useState<BulkAction>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const openConfirm = useConfirm((state) => state.open);
  const { removeImagesAsync } = useRemoveImages();
  const { deleteCategoryAsync } = useDeleteCategory();
  const { toggleCategoryAsync } = useToggleDeleted();

  // Memoized values
  const selectedCategoriesData = useMemo(() => {
    return categories.filter((category) => selectedCategories.has(category.id));
  }, [categories, selectedCategories]);

  const isAllSelected = useMemo(() => {
    return (
      categories.length > 0 && selectedCategories.size === categories.length
    );
  }, [categories.length, selectedCategories.size]);

  const isIndeterminate = useMemo(() => {
    return (
      selectedCategories.size > 0 && selectedCategories.size < categories.length
    );
  }, [selectedCategories.size, categories.length]);

  const selectedCount = selectedCategories.size;
  const hasSelection = selectedCount > 0;

  // Selection handlers
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedCategories(new Set(categories.map((cat) => cat.id)));
      } else {
        setSelectedCategories(new Set());
      }
    },
    [categories]
  );

  const handleSelectCategory = useCallback(
    (categoryId: string, checked: boolean) => {
      setSelectedCategories((prev) => {
        const newSet = new Set(prev);
        if (checked) {
          newSet.add(categoryId);
        } else {
          newSet.delete(categoryId);
        }
        return newSet;
      });
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedCategories(new Set());
    setBulkAction("");
  }, []);

  // Bulk action handlers
  const handleBulkToggleDeleted = useCallback(async () => {
    if (selectedCategories.size === 0) return;

    const selectedCats = selectedCategoriesData;
    const activeCount = selectedCats.filter((cat) => !cat.is_deleted).length;
    const deletedCount = selectedCats.filter((cat) => cat.is_deleted).length;

    openConfirm({
      title: "Bulk Toggle Status",
      description: `Are you sure you want to toggle status for ${selectedCategories.size} categories?
- ${activeCount} active categories will be moved to trash
- ${deletedCount} deleted categories will be restored`,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await Promise.all(
            selectedCats.map((category) =>
              toggleCategoryAsync({ id: category.id })
            )
          );
          clearSelection();
          toast.success(
            `Successfully toggled ${selectedCategories.size} categories`
          );
        } catch (error: any) {
          toast.error(error?.message || "Failed to toggle categories");
        } finally {
          setIsProcessing(false);
        }
      },
    });
  }, [
    selectedCategories,
    selectedCategoriesData,
    openConfirm,
    toggleCategoryAsync,
    clearSelection,
  ]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedCategories.size === 0) return;

    const selectedCats = selectedCategoriesData;
    const categoryNames = selectedCats.map((cat) => cat.name).join(", ");

    openConfirm({
      title: "Permanent Bulk Deletion Warning",
      description: `Are you absolutely sure you want to permanently delete these ${selectedCategories.size} categories?

Categories: ${categoryNames}

This action CANNOT be undone and will:
- Remove all categories forever
- Delete associated images
- Remove all relationships`,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          // Remove images first
          const publicIds = selectedCats
            .filter((cat) => cat.public_id)
            .map((cat) => cat.public_id!);

          if (publicIds.length > 0) {
            await removeImagesAsync({ publicIds });
          }

          // Delete categories
          await Promise.all(
            selectedCats.map((category) =>
              deleteCategoryAsync({ id: category.id })
            )
          );

          clearSelection();
          toast.success(
            `Successfully deleted ${selectedCategories.size} categories`
          );
        } catch (error: any) {
          toast.error(error?.message || "Failed to delete categories");
        } finally {
          setIsProcessing(false);
        }
      },
    });
  }, [
    selectedCategories,
    selectedCategoriesData,
    openConfirm,
    deleteCategoryAsync,
    removeImagesAsync,
    clearSelection,
  ]);

  const handleBulkAction = useCallback(async () => {
    if (!bulkAction || selectedCategories.size === 0) {
      toast.error("Please select categories and an action");
      return;
    }

    switch (bulkAction) {
      case "toggle_deleted":
        await handleBulkToggleDeleted();
        break;
      case "delete_permanently":
        await handleBulkDelete();
        break;
    }
  }, [
    bulkAction,
    selectedCategories.size,
    handleBulkToggleDeleted,
    handleBulkDelete,
  ]);

  return {
    // State
    selectedCategories,
    bulkAction,
    isProcessing,

    // Computed values
    selectedCategoriesData,
    isAllSelected,
    isIndeterminate,
    selectedCount,
    hasSelection,

    // Actions
    setBulkAction,
    handleSelectAll,
    handleSelectCategory,
    clearSelection,
    handleBulkAction,
    handleBulkToggleDeleted,
    handleBulkDelete,
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

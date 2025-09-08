"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { MAX_FILE_CATEGORY } from "@/lib/constants";
import { useConfirm } from "@/stores/confirm-store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BulkAction, EntityType, LocalImagePreview } from "./types";
import { convertFileToBase64, generateUniqueId } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useDeleteSubcategory,
  useToggleSubcategoryDeleted,
} from "./custom-hook-subcategory";
import {
  Category,
  Subcategory,
  useCategoriesStore,
} from "@/stores/admin/categories-store";

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

export interface SelectionState {
  categories: Set<string>;
  subcategories: Set<string>;
}

export const useCategorySelection = (categories: Category[]) => {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<
    Set<string>
  >(new Set());

  // Memoized values for categories
  const selectedCategoriesData = useMemo(() => {
    return categories.filter((category) => selectedCategories.has(category.id));
  }, [categories, selectedCategories]);

  const isAllCategoriesSelected = useMemo(() => {
    return (
      categories.length > 0 && selectedCategories.size === categories.length
    );
  }, [categories.length, selectedCategories.size]);

  const isCategoriesIndeterminate = useMemo(() => {
    return (
      selectedCategories.size > 0 && selectedCategories.size < categories.length
    );
  }, [selectedCategories.size, categories.length]);

  // Memoized values for subcategories
  const allSubcategories = useMemo(() => {
    return categories.flatMap((cat) => cat.subcategories);
  }, [categories]);

  const selectedSubcategoriesData = useMemo(() => {
    return allSubcategories.filter((sub) => selectedSubcategories.has(sub.id));
  }, [allSubcategories, selectedSubcategories]);

  const isAllSubcategoriesSelected = useMemo(() => {
    return (
      allSubcategories.length > 0 &&
      selectedSubcategories.size === allSubcategories.length
    );
  }, [allSubcategories.length, selectedSubcategories.size]);

  const isSubcategoriesIndeterminate = useMemo(() => {
    return (
      selectedSubcategories.size > 0 &&
      selectedSubcategories.size < allSubcategories.length
    );
  }, [selectedSubcategories.size, allSubcategories.length]);

  // Category selection handlers
  const handleSelectAllCategories = useCallback(
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

  // Subcategory selection handlers
  const handleSelectAllSubcategories = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedSubcategories(
          new Set(allSubcategories.map((sub) => sub.id))
        );
      } else {
        setSelectedSubcategories(new Set());
      }
    },
    [allSubcategories]
  );

  const handleSelectSubcategory = useCallback(
    (subcategoryId: string, checked: boolean) => {
      setSelectedSubcategories((prev) => {
        const newSet = new Set(prev);
        if (checked) {
          newSet.add(subcategoryId);
        } else {
          newSet.delete(subcategoryId);
        }
        return newSet;
      });
    },
    []
  );

  // Category-specific subcategory handlers
  const handleSelectAllSubcategoriesInCategory = useCallback(
    (categoryId: string, checked: boolean) => {
      const category = categories.find((cat) => cat.id === categoryId);
      if (!category) return;

      setSelectedSubcategories((prev) => {
        const newSet = new Set(prev);
        category.subcategories.forEach((sub) => {
          if (checked) {
            newSet.add(sub.id);
          } else {
            newSet.delete(sub.id);
          }
        });
        return newSet;
      });
    },
    [categories]
  );

  const getCategorySubcategorySelection = useCallback(
    (categoryId: string) => {
      const category = categories.find((cat) => cat.id === categoryId);
      if (!category) return { isAllSelected: false, isIndeterminate: false };

      const selectedCount = category.subcategories.filter((sub) =>
        selectedSubcategories.has(sub.id)
      ).length;

      const isAllSelected =
        category.subcategories.length > 0 &&
        selectedCount === category.subcategories.length;
      const isIndeterminate =
        selectedCount > 0 && selectedCount < category.subcategories.length;

      return { isAllSelected, isIndeterminate };
    },
    [categories, selectedSubcategories]
  );

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedCategories(new Set());
    setSelectedSubcategories(new Set());
  }, []);

  const clearCategorySelection = useCallback(() => {
    setSelectedCategories(new Set());
  }, []);

  const clearSubcategorySelection = useCallback(() => {
    setSelectedSubcategories(new Set());
  }, []);

  return {
    // Selection state
    selectedCategories,
    selectedSubcategories,
    selectedCategoriesData,
    selectedSubcategoriesData,

    // Category selection state
    isAllCategoriesSelected,
    isCategoriesIndeterminate,
    selectedCategoriesCount: selectedCategories.size,
    hasCategorySelection: selectedCategories.size > 0,

    // Subcategory selection state
    isAllSubcategoriesSelected,
    isSubcategoriesIndeterminate,
    selectedSubcategoriesCount: selectedSubcategories.size,
    hasSubcategorySelection: selectedSubcategories.size > 0,

    // Handlers
    handleSelectAllCategories,
    handleSelectCategory,
    handleSelectAllSubcategories,
    handleSelectSubcategory,
    handleSelectAllSubcategoriesInCategory,
    getCategorySubcategorySelection,
    clearSelection,
    clearCategorySelection,
    clearSubcategorySelection,

    // Utils
    allSubcategories,
  };
};

export const useBulkActions = () => {
  const openConfirm = useConfirm((state) => state.open);

  const { removeImagesAsync } = useRemoveImages();
  const { deleteCategoryAsync } = useDeleteCategory();
  const { toggleCategoryAsync } = useToggleDeleted();
  const { toggleSubcategoryAsync } = useToggleSubcategoryDeleted();
  const { deleteSubcategoryAsync } = useDeleteSubcategory();

  const [bulkAction, setBulkAction] = useState<BulkAction>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Category bulk actions
  const handleBulkToggleCategories = useCallback(
    async (selectedCategories: Category[], onComplete: () => void) => {
      if (selectedCategories.length === 0) return;

      const activeCount = selectedCategories.filter(
        (cat) => !cat.is_deleted
      ).length;
      const deletedCount = selectedCategories.filter(
        (cat) => cat.is_deleted
      ).length;

      openConfirm({
        title: "Bulk Toggle Status",
        description: `Are you sure you want to toggle status for ${selectedCategories.length} categories?
    - ${activeCount} active categories will be moved to trash
    - ${deletedCount} deleted categories will be restored`,
        onConfirm: async () => {
          setIsProcessing(true);
          try {
            await Promise.all(
              selectedCategories.map((category) =>
                toggleCategoryAsync({ id: category.id })
              )
            );
            onComplete();
          } catch (error: any) {
            toast.error(error?.message || "Failed to toggle categories");
          } finally {
            setIsProcessing(false);
          }
        },
      });
    },
    [openConfirm, toggleCategoryAsync]
  );

  const handleBulkDeleteCategories = useCallback(
    async (selectedCategories: Category[], onComplete: () => void) => {
      if (selectedCategories.length === 0) return;

      const categoryNames = selectedCategories
        .map((cat) => cat.name)
        .join(", ");

      openConfirm({
        title: "Permanent Bulk Deletion Warning",
        description: `Are you absolutely sure you want to permanently delete these ${selectedCategories.length} categories?
      
    Categories: ${categoryNames}
    
    This action CANNOT be undone and will:
    - Remove all categories forever
    - Delete associated images
    - Remove all relationships`,
        onConfirm: async () => {
          setIsProcessing(true);
          try {
            // Remove images first
            const publicIds = selectedCategories
              .filter((cat) => cat.public_id)
              .map((cat) => cat.public_id!);

            if (publicIds.length > 0) {
              await removeImagesAsync({ publicIds });
            }

            // Delete categories
            await Promise.all(
              selectedCategories.map((category) =>
                deleteCategoryAsync({ id: category.id })
              )
            );

            onComplete();
          } catch (error: any) {
            toast.error(error?.message || "Failed to delete categories");
          } finally {
            setIsProcessing(false);
          }
        },
      });
    },
    [openConfirm, deleteCategoryAsync, removeImagesAsync]
  );

  // Subcategory bulk actions
  const handleBulkToggleSubcategories = useCallback(
    async (selectedSubcategories: Subcategory[], onComplete: () => void) => {
      if (selectedSubcategories.length === 0) return;

      const activeCount = selectedSubcategories.filter(
        (sub) => !sub.is_deleted
      ).length;
      const deletedCount = selectedSubcategories.filter(
        (sub) => sub.is_deleted
      ).length;

      openConfirm({
        title: "Bulk Toggle Subcategory Status",
        description: `Are you sure you want to toggle status for ${selectedSubcategories.length} subcategories?
    - ${activeCount} active subcategories will be moved to trash
    - ${deletedCount} deleted subcategories will be restored`,
        onConfirm: async () => {
          setIsProcessing(true);
          try {
            await Promise.all(
              selectedSubcategories.map((subcategory) =>
                toggleSubcategoryAsync({ id: subcategory.id })
              )
            );
            onComplete();
          } catch (error: any) {
            toast.error(error?.message || "Failed to toggle subcategories");
          } finally {
            setIsProcessing(false);
          }
        },
      });
    },
    [openConfirm, toggleSubcategoryAsync]
  );

  const handleBulkDeleteSubcategories = useCallback(
    async (selectedSubcategories: Subcategory[], onComplete: () => void) => {
      if (selectedSubcategories.length === 0) return;

      const subcategoryNames = selectedSubcategories
        .map((sub) => sub.name)
        .join(", ");

      openConfirm({
        title: "Permanent Bulk Deletion Warning",
        description: `Are you absolutely sure you want to permanently delete these ${selectedSubcategories.length} subcategories?
      
    Subcategories: ${subcategoryNames}
    
    This action CANNOT be undone and will:
    - Remove all subcategories forever
    - Delete associated images
    - Remove all relationships`,
        onConfirm: async () => {
          setIsProcessing(true);
          try {
            // Remove images first
            const publicIds = selectedSubcategories
              .filter((sub) => sub.public_id)
              .map((sub) => sub.public_id!);

            if (publicIds.length > 0) {
              await removeImagesAsync({ publicIds });
            }

            // Delete subcategories
            await Promise.all(
              selectedSubcategories.map((subcategory) =>
                deleteSubcategoryAsync({ id: subcategory.id })
              )
            );

            onComplete();
          } catch (error: any) {
            toast.error(error?.message || "Failed to delete subcategories");
          } finally {
            setIsProcessing(false);
          }
        },
      });
    },
    [openConfirm, deleteSubcategoryAsync, removeImagesAsync]
  );

  // Generic bulk action handler
  const executeBulkAction = useCallback(
    async (
      action: BulkAction,
      entityType: EntityType,
      selectedData: Category[] | Subcategory[],
      onComplete: () => void
    ) => {
      if (!action || selectedData.length === 0) {
        toast.error(
          `Please select ${
            entityType === "category" ? "categories" : "subcategories"
          } and an action`
        );
        return;
      }

      if (entityType === "category") {
        const categories = selectedData as Category[];
        switch (action) {
          case "toggle_deleted":
            await handleBulkToggleCategories(categories, onComplete);
            break;
          case "delete_permanently":
            await handleBulkDeleteCategories(categories, onComplete);
            break;
        }
      } else {
        const subcategories = selectedData as Subcategory[];
        switch (action) {
          case "toggle_deleted":
            await handleBulkToggleSubcategories(subcategories, onComplete);
            break;
          case "delete_permanently":
            await handleBulkDeleteSubcategories(subcategories, onComplete);
            break;
        }
      }
    },
    [
      handleBulkToggleCategories,
      handleBulkDeleteCategories,
      handleBulkToggleSubcategories,
      handleBulkDeleteSubcategories,
    ]
  );

  return {
    bulkAction,
    setBulkAction,
    isProcessing,
    executeBulkAction,
    handleBulkToggleCategories,
    handleBulkDeleteCategories,
    handleBulkToggleSubcategories,
    handleBulkDeleteSubcategories,
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

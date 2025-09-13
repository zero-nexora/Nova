"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { MAX_FILE_CATEGORY } from "@/lib/constants";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LocalImagePreview } from "./types";
import { convertFileToBase64, generateUniqueId } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, useCategoriesStore } from "@/stores/admin/categories-store";

export const getCategoryQueryKeys = (trpc: ReturnType<typeof useTRPC>) => ({
  all: () => trpc.admin.categoriesRouter.getAll.queryOptions(),
});

export function useGetAllCategories() {
  const trpc = useTRPC();
  const setCategories = useCategoriesStore((state) => state.setCategories);
  const setLoading = useCategoriesStore((state) => state.setLoading);
  const setError = useCategoriesStore((state) => state.setError);

  const { data, error, isPending } = useQuery(
    trpc.admin.categoriesRouter.getAll.queryOptions()
  );

  useEffect(() => {
    if (data) {
      setCategories(data);
    }
  }, [data]);

  useEffect(() => {
    setLoading(isPending);
  }, [isPending]);

  useEffect(() => {
    if (error) setError(error);
  }, [error]);

  return {
    error,
    categories: data,
    isPending: isPending,
  };
}

export function useCreateCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation({
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
    createCategory: mutate,
    createCategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

export function useUpdateCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, error, isPending } = useMutation({
    ...trpc.admin.categoriesRouter.update.mutationOptions(),
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update category");
    },
  });

  return {
    updateCategory: mutate,
    updateCategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

export function useDeleteCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation({
    ...trpc.admin.categoriesRouter.delete.mutationOptions(),
    onSuccess: () => {
      toast.success("Category permanently deleted");
      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete category");
    },
  });

  return {
    deleteCategory: mutate,
    deleteCategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

export function useToggleDeleted() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation({
    ...trpc.admin.categoriesRouter.toggleDeleted.mutationOptions(),
    onSuccess: (data) => {
      const message = data.is_deleted
        ? `Category "${data.name}" moved to trash successfully`
        : `Category "${data.name}" restored successfully`;
      toast.success(message);
      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle category");
    },
  });

  return {
    toggleCategory: mutate,
    toggleCategoryAsync: mutateAsync,
    isPending,
    error,
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

export const useCategorySelection = (categories: Category[]) => {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDeleted, setFilterDeleted] = useState<
    "all" | "active" | "deleted"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "created_at" | "updated_at">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter and search categories
  const filteredCategories = useMemo(() => {
    const filtered = categories.filter((category) => {
      const matchesSearch = category.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterDeleted === "all" ||
        (filterDeleted === "active" && !category.is_deleted) ||
        (filterDeleted === "deleted" && category.is_deleted);

      return matchesSearch && matchesFilter;
    });

    // Sort categories
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "updated_at":
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [categories, searchTerm, filterDeleted, sortBy, sortOrder]);

  // Memoized values for categories
  const selectedCategoriesData = useMemo(() => {
    return categories.filter((category) => selectedCategories.has(category.id));
  }, [categories, selectedCategories]);

  const isAllCategoriesSelected = useMemo(() => {
    return (
      filteredCategories.length > 0 &&
      filteredCategories.every((cat) => selectedCategories.has(cat.id))
    );
  }, [filteredCategories, selectedCategories]);

  const isCategoriesIndeterminate = useMemo(() => {
    const selectedCount = filteredCategories.filter((cat) =>
      selectedCategories.has(cat.id)
    ).length;
    return selectedCount > 0 && selectedCount < filteredCategories.length;
  }, [filteredCategories, selectedCategories]);

  // Category selection handlers
  const handleSelectAllCategories = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedCategories(new Set(filteredCategories.map((cat) => cat.id)));
      } else {
        setSelectedCategories(new Set());
      }
    },
    [filteredCategories]
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

  // Clear selection
  const clearCategorySelection = useCallback(() => {
    setSelectedCategories(new Set());
  }, []);

  // Search and filter handlers
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleFilterChange = useCallback(
    (filter: "all" | "active" | "deleted") => {
      setFilterDeleted(filter);
    },
    []
  );

  const handleSortChange = useCallback(
    (sort: "name" | "created_at" | "updated_at") => {
      setSortBy(sort);
    },
    []
  );

  const handleSortOrderChange = useCallback((order: "asc" | "desc") => {
    setSortOrder(order);
  }, []);

  return {
    // Selection state
    selectedCategories,
    selectedCategoriesData,
    filteredCategories,

    // Category selection state
    isAllCategoriesSelected,
    isCategoriesIndeterminate,
    selectedCategoriesCount: selectedCategories.size,
    hasCategorySelection: selectedCategories.size > 0,

    // Search and filter state
    searchTerm,
    filterDeleted,
    sortBy,
    sortOrder,

    // Handlers
    handleSelectAllCategories,
    handleSelectCategory,
    clearCategorySelection,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handleSortOrderChange,
  };
};

export function useUploadImages() {
  const trpc = useTRPC();

  const { mutateAsync, mutate, isPending, error } = useMutation({
    ...trpc.upload.uploadImages.mutationOptions(),
    onSuccess: () => {
      toast.success("Images uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload images");
    },
  });

  return {
    uploadImages: mutate,
    uploadImagesAsync: mutateAsync,
    isPending,
    error,
  };
}

export function useRemoveImages() {
  const trpc = useTRPC();

  const { mutateAsync, mutate, isPending, error } = useMutation({
    ...trpc.upload.removeImages.mutationOptions(),
    onSuccess: () => {
      toast.success("Images removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove images");
    },
  });

  return {
    removeImagesAsync: mutateAsync,
    removeImages: mutate,
    isPending,
    error,
  };
}

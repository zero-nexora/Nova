"use client";

import { toast } from "sonner";
import { useCallback, useMemo, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useModal } from "@/stores/modal-store";
import { useConfirm } from "@/stores/confirm-store";
import { Subcategory } from "@/stores/admin/categories-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategoryQueryKeys, useRemoveImages } from "./custom-hook-category";
import { UpdateSubcategoryForm } from "@/components/forms/update-subcategory-form";

export function useGetAllSubcategories() {
  const trpc = useTRPC();

  const { data, isPending } = useQuery(
    trpc.admin.subcategoriesRouter.getAll.queryOptions()
  );

  return {
    activeSubcategories: data?.activeSubcategories || [],
    deletedSubcategories: data?.deletedSubcategories || [],
    isPending,
  };
}

export function useCreateSubcategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation({
    ...trpc.admin.subcategoriesRouter.create.mutationOptions(),
    onSuccess: () => {
      toast.success("Subcategory created successfully");
      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create subcategory");
    },
  });

  return {
    createSubcategory: mutate,
    createSubcategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

export function useUpdateSubcategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation({
    ...trpc.admin.subcategoriesRouter.update.mutationOptions(),
    onSuccess: () => {
      toast.success("Subcategory updated successfully");
      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update subcategory");
    },
  });

  return {
    updateSubcategory: mutate,
    updateSubcategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

export function useDeleteSubcategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation({
    ...trpc.admin.subcategoriesRouter.delete.mutationOptions(),
    onSuccess: () => {
      toast.success("Subcategory permanently deleted");
      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete subcategory");
    },
  });

  return {
    deleteSubcategory: mutate,
    deleteSubcategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

export function useToggleSubcategoryDeleted() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation({
    ...trpc.admin.subcategoriesRouter.toggleDeleted.mutationOptions(),
    onSuccess: (data) => {
      const message = data.is_deleted
        ? `Subcategory "${data.name}" moved to trash successfully`
        : `Subcategory "${data.name}" restored successfully`;
      toast.success(message);

      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle subcategory");
    },
  });

  return {
    toggleSubcategory: mutate,
    toggleSubcategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

export const useSubcategoryActions = () => {
  const openModal = useModal((state) => state.open);
  const openConfirm = useConfirm((state) => state.open);
  const { removeImagesAsync } = useRemoveImages();
  const { toggleSubcategoryAsync } = useToggleSubcategoryDeleted();
  const { deleteSubcategoryAsync } = useDeleteSubcategory();

  const handleUpdateSubcategory = useCallback(
    (subcategory: Subcategory) => {
      openModal({
        title: "Update Subcategory",
        description: "Update subcategory information",
        children: <UpdateSubcategoryForm data={subcategory} />,
      });
    },
    [openModal]
  );

  const handleToggleSubcategory = useCallback(
    async (subcategory: Subcategory) => {
      try {
        openConfirm({
          title: subcategory.is_deleted
            ? "Restore Subcategory"
            : "Move to Trash",
          description: subcategory.is_deleted
            ? "Are you sure you want to restore this subcategory?"
            : "Are you sure you want to move this subcategory to trash?",
          onConfirm: async () => {
            await toggleSubcategoryAsync({ id: subcategory.id });
          },
        });
      } catch (error: any) {
        toast.error(error?.message || "Failed to toggle subcategory status");
      }
    },
    [toggleSubcategoryAsync, openConfirm]
  );

  const handleDeleteSubcategory = useCallback(
    async (subcategory: Subcategory) => {
      try {
        openConfirm({
          title: "Permanent Deletion Warning",
          description: `Are you absolutely sure you want to permanently delete "${subcategory.name}"? This action CANNOT be undone and will:
- Remove the subcategory forever
- Delete associated images
- Remove all relationships`,
          onConfirm: async () => {
            try {
              if (subcategory.public_id) {
                await removeImagesAsync({ publicIds: [subcategory.public_id] });
              }
              await deleteSubcategoryAsync({ id: subcategory.id });
            } catch (error: any) {
              toast.error(
                error?.message || "Failed to permanently delete subcategory"
              );
            }
          },
        });
      } catch (error: any) {
        toast.error(error?.message || "Failed to move subcategory to trash");
      }
    },
    [deleteSubcategoryAsync, removeImagesAsync, openConfirm]
  );

  return {
    handleUpdateSubcategory,
    handleToggleSubcategory,
    handleDeleteSubcategory,
  };
};

export const useSubcategorySelection = (subcategories: Subcategory[]) => {
  const [selectedSubcategories, setSelectedSubcategories] = useState<
    Set<string>
  >(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDeleted, setFilterDeleted] = useState<
    "all" | "active" | "deleted"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "created_at" | "updated_at">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter + Search + Sort
  const filteredSubcategories = useMemo(() => {
    const filtered = subcategories.filter((subcategory) => {
      const matchesSearch = subcategory.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterDeleted === "all" ||
        (filterDeleted === "active" && !subcategory.is_deleted) ||
        (filterDeleted === "deleted" && subcategory.is_deleted);

      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

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
  }, [subcategories, searchTerm, filterDeleted, sortBy, sortOrder]);

  // Selected subcategories data
  const selectedSubcategoriesData = useMemo(() => {
    return subcategories.filter((sub) => selectedSubcategories.has(sub.id));
  }, [subcategories, selectedSubcategories]);

  const isAllSubcategoriesSelected = useMemo(() => {
    return (
      filteredSubcategories.length > 0 &&
      filteredSubcategories.every((sub) => selectedSubcategories.has(sub.id))
    );
  }, [filteredSubcategories, selectedSubcategories]);

  const isSubcategoriesIndeterminate = useMemo(() => {
    const selectedCount = filteredSubcategories.filter((sub) =>
      selectedSubcategories.has(sub.id)
    ).length;
    return selectedCount > 0 && selectedCount < filteredSubcategories.length;
  }, [filteredSubcategories, selectedSubcategories]);

  // Selection handlers
  const handleSelectAllSubcategories = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedSubcategories(
          new Set(filteredSubcategories.map((sub) => sub.id))
        );
      } else {
        setSelectedSubcategories(new Set());
      }
    },
    [filteredSubcategories]
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

  const clearSubcategorySelection = useCallback(() => {
    setSelectedSubcategories(new Set());
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
    // State
    selectedSubcategories,
    selectedSubcategoriesData,
    filteredSubcategories,

    // Selection state
    isAllSubcategoriesSelected,
    isSubcategoriesIndeterminate,
    selectedSubcategoriesCount: selectedSubcategories.size,
    hasSubcategorySelection: selectedSubcategories.size > 0,

    // Search & filter state
    searchTerm,
    filterDeleted,
    sortBy,
    sortOrder,

    // Handlers
    handleSelectAllSubcategories,
    handleSelectSubcategory,
    clearSubcategorySelection,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handleSortOrderChange,
  };
};

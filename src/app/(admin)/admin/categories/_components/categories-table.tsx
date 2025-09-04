"use client";

import { useMemo, useCallback } from "react";
import { createCategoryColumns } from "./columns";
import { CategoryColumn } from "@/lib/types";
import { DataTable } from "./data-table";
import { useModal } from "@/stores/modal-store";
import { UpdateCategoryForm } from "@/components/forms/update-category-form";
import { toast } from "sonner";
import {
  useDeleteCategory,
  useGetAllCategories,
  useRemoveImages,
  useToggleDeleted,
} from "../hooks/custom-hook";
import { useConfirm } from "@/stores/confirm-store";

export const CategoriesTable = () => {
  const { open: openModal } = useModal();
  const { open: openConfirm } = useConfirm();

  const { categories, isFetching } = useGetAllCategories();
  const { deleteCategoryAsync } = useDeleteCategory();
  const { toggleCategoryAsync } = useToggleDeleted();
  const { removeImagesAsync } = useRemoveImages();

  const handleEditCategory = useCallback(
    (category: CategoryColumn) => {
      openModal({
        children: <UpdateCategoryForm data={category} />,
        title: "Update Category",
        description: "Update category information",
      });
    },
    [openModal]
  );

  const handleDeleteCategory = useCallback(
    async (category: CategoryColumn) => {
      try {
        openConfirm({
          title: "Permanent Deletion Warning",
          description: `Are you absolutely sure you want to permanently delete "${category.name}"? This action CANNOT be undone and will:
- Remove the category forever
- Delete associated images
- Remove all relationships`,
          onConfirm: async () => {
            try {
              if (category.public_id) {
                await removeImagesAsync({ publicIds: [category.public_id] });
              }
              await deleteCategoryAsync({ id: category.id });
            } catch (error: any) {
              toast.dismiss();
              toast.error(
                error?.message || "Failed to permanently delete category"
              );
            }
          },
        });
      } catch (error: any) {
        toast.dismiss();
        toast.error(error?.message || "Failed to move category to trash");
      }
    },
    [deleteCategoryAsync, removeImagesAsync, openConfirm]
  );

  const handleToggleCategory = useCallback(
    async (category: CategoryColumn) => {
      try {
        openConfirm({
          title: "Restore Category",
          description: `Are you sure you want to restore "${category.name}" from trash?`,
          onConfirm: async () => {
            await toggleCategoryAsync({ id: category.id });
          },
        });
      } catch (error: any) {
        toast.dismiss();
        toast.error(error?.message || "Failed to restore category");
      }
    },
    [toggleCategoryAsync, openConfirm]
  );

  const columns = useMemo(
    () =>
      createCategoryColumns({
        onEdit: handleEditCategory,
        onDelete: handleDeleteCategory,
        onToggle: handleToggleCategory,
      }),
    [handleEditCategory, handleDeleteCategory, handleToggleCategory]
  );

  const isLoading = isFetching;

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={categories} isLoading={isLoading} />
    </div>
  );
};

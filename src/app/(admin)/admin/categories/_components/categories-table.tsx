"use client";

import { useMemo, useCallback } from "react";
import { CategoryRow, createCategoryColumns } from "./columns";
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
import { flattenCategories } from "@/lib/utils";
import { Category, useCategoriesStore } from "@/stores/admin/categories-store";

export const CategoriesTable = () => {
  const { open: openModal } = useModal();
  const { open: openConfirm } = useConfirm();

  const { isFetching } = useGetAllCategories();
  const { activeCategories, deletedCategories } = useCategoriesStore(
    (state) => state
  );
  const { deleteCategoryAsync } = useDeleteCategory();
  const { toggleCategoryAsync } = useToggleDeleted();
  const { removeImagesAsync } = useRemoveImages();

  const handleEditCategory = useCallback(
    (category: CategoryRow) => {
      openModal({
        children: <UpdateCategoryForm data={category} />,
        title: "Update Category",
        description: "Update category information",
      });
    },
    [openModal]
  );

  const handleDeleteCategory = useCallback(
    async (category: CategoryRow) => {
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
    async (category: CategoryRow) => {
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
      <DataTable
        columns={columns}
        data={flattenCategories(activeCategories as Category[])}
        isLoading={isLoading}
      />
      <DataTable
        columns={columns}
        data={flattenCategories(deletedCategories as Category[])}
        isLoading={isLoading}
      />
    </div>
  );
};

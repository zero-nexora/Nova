"use client";

import { useMemo, useCallback } from "react";
import { createCategoryColumns } from "./columns";
import { CategoryColumn } from "@/lib/types";
import { DataTable } from "./data-table";
import { useModal } from "@/stores/modal-store";
import { UpdateCategoryForm } from "@/components/forms/update-category-form";
import {
  useDeleteCategory,
  useGetAllCategories,
  useRemoveImages,
} from "../hooks/custom-hook";

export const CategoriesTable = () => {
  const { open } = useModal();

  const { categories, isFetching } = useGetAllCategories();
  const { deleteCategoryAsync, isLoading } = useDeleteCategory();
  const { removeImagesAsync } = useRemoveImages();

  const handleEditCategory = useCallback(
    (category: CategoryColumn) => {
      open({
        children: <UpdateCategoryForm data={category} />,
        title: "Update Category",
        description: "Update a category",
      });
    },
    [open]
  );

  const handleDeleteCategory = useCallback(async (category: CategoryColumn) => {
    const payloadDeleteImages = {
      publicIds: [category.public_id ?? ""],
    };
    await removeImagesAsync(payloadDeleteImages);
    await deleteCategoryAsync({ id: category.id, hard_delete: false });
  }, []);

  const handleViewCategory = useCallback((category: CategoryColumn) => {
    console.log("Viewing category:", category);
  }, []);

  const handlePageChange = useCallback((page: number) => {}, []);

  const handleSearch = useCallback((value: string) => {}, []);

  const columns = useMemo(
    () =>
      createCategoryColumns({
        onEdit: handleEditCategory,
        onDelete: handleDeleteCategory,
        onView: handleViewCategory,
      }),
    [handleEditCategory, handleDeleteCategory, handleViewCategory]
  );

  return (
    <DataTable columns={columns} data={categories} isLoading={isFetching || isLoading} />
  );
};

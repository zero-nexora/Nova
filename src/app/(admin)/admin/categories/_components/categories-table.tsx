"use client";

import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { createCategoryColumns } from "./columns";
import { CategoryColumn } from "@/lib/types";
import { useTRPC } from "@/trpc/client";
import { DataTableSkeleton } from "@/components/global/data-table-skeleton";
import { DataTable } from "./data-table";
import { useModal } from "@/stores/modal-store";
import { UpdateCategoryForm } from "@/components/forms/update-category-form";

export const CategoriesTable = () => {
  const trpc = useTRPC();
  const { mutate, isPending: isUpdatePending } = useMutation(
    trpc.categoriesAdmin.updateCategory.mutationOptions()
  );
  const { open } = useModal();

  // Query data với error handling
  const {
    data: categories,
    isPending,
    error,
    refetch,
  } = useQuery({
    ...trpc.categoriesAdmin.getMany.queryOptions(),
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({});

  const handleEditCategory = (category: CategoryColumn) => {
    open({
      children: <UpdateCategoryForm data={category} />,
      title: "Update Category",
      description: "Update a category",
    });
  };

  const handleDeleteCategory = async (category: CategoryColumn) => {};

  const handleViewCategory = (category: CategoryColumn) => {
    // Navigate to detail page
    // router.push(`/admin/categories/${category.id}`);
    console.log("Viewing category:", category);
  };

  // Memoize columns để tránh re-render không cần thiết
  const columns = useMemo(
    () =>
      createCategoryColumns({
        onEdit: handleEditCategory,
        onDelete: handleDeleteCategory,
        onView: handleViewCategory,
      }),
    []
  );

  if (isPending) {
    return <DataTableSkeleton columnCount={7} rowCount={10} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">Failed to load categories</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={categories || []}
        searchKey="name"
        searchPlaceholder="Search categories..."
      />
    </>
  );
};

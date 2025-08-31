"use client";

import { useMemo, useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { createCategoryColumns } from "./columns";
import { CategoryColumn } from "@/lib/types";
import { useTRPC } from "@/trpc/client";
import { DataTableSkeleton } from "@/components/global/data-table-skeleton";
import { DataTable } from "./data-table";
import { useModal } from "@/stores/modal-store";
import { UpdateCategoryForm } from "@/components/forms/update-category-form";


// debounce search


export const CategoriesTable = () => {
  const trpc = useTRPC();
  const { open } = useModal();

  // State cho pagination và search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 10;

  // Query data với pagination parameters
  const {
    data: response,
    isPending,
    error,
    refetch,
  } = useQuery({
    ...trpc.categoriesAdmin.getAll.queryOptions({
      page: currentPage,
      limit: pageSize,
      search: searchQuery,
    }),
    retry: 3,
    staleTime: 5 * 60 * 1000,
    // Query key sẽ tự động update khi page hoặc search thay đổi
  });

  const deleteMutation = useMutation({});

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
    // Implement delete logic
  }, []);

  const handleViewCategory = useCallback((category: CategoryColumn) => {
    console.log("Viewing category:", category);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle search với debounce effect
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset về trang 1 khi search
  }, []);

  // Memoize columns
  const columns = useMemo(
    () =>
      createCategoryColumns({
        onEdit: handleEditCategory,
        onDelete: handleDeleteCategory,
        onView: handleViewCategory,
      }),
    [handleEditCategory, handleDeleteCategory, handleViewCategory]
  );

  // Loading state
  if (isPending && currentPage === 1 && !searchQuery) {
    return <DataTableSkeleton columnCount={7} rowCount={10} />;
  }

  // Error state
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

  // Prepare pagination data
  const paginationData = {
    currentPage,
    totalPages: response?.pagination.totalPages || 1,
    totalItems: response?.pagination.totalItems || 0,
    pageSize,
  };

  return (
    <DataTable
      columns={columns}
      data={response?.data || []}
      pagination={paginationData}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
      searchKey="name"
      searchPlaceholder="Search categories..."
      isLoading={isPending}
    />
  );
};

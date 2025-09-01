"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { createCategoryColumns } from "./columns";
import { CategoryColumn } from "@/lib/types";
import { DataTable } from "./data-table";
import { useModal } from "@/stores/modal-store";
import { UpdateCategoryForm } from "@/components/forms/update-category-form";
import { useGetAllCategories } from "../hooks/custom-hook";

// custom hook debounce
function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

export const CategoriesTable = () => {
  const { open } = useModal();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const pageSize = 10;

  // debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  const { categories, error, refetch, isFetching, pagination } =
    useGetAllCategories({
      limit: pageSize,
      page: currentPage,
      search: debouncedSearch,
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

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
  }, []);

  const columns = useMemo(
    () =>
      createCategoryColumns({
        onEdit: handleEditCategory,
        onDelete: handleDeleteCategory,
        onView: handleViewCategory,
      }),
    [handleEditCategory, handleDeleteCategory, handleViewCategory]
  );

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

  const paginationData = {
    currentPage,
    totalPages: pagination?.totalPages || 1,
    totalItems: pagination?.totalItems || 0,
    pageSize,
  };

  return (
    <DataTable
      columns={columns}
      data={categories || []}
      pagination={paginationData}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
      searchKey="name"
      searchPlaceholder="Search categories..."
      isLoading={isFetching}
    />
  );
};

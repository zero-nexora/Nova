"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetAllProducts,
  useProductFilters,
  useToggleProductDeleted,
} from "@/app/(admin)/admin/products/hooks/custom-hook-product";
import { useCategoriesStore } from "@/stores/admin/categories-store";
import { toast } from "sonner";
import { ProductTable } from "../hooks/types";
import { createProductColumns } from "./product-columns";
import { ProductFiltersComponent } from "./product-filters";
import { ProductTableComponent } from "./product-table";
import { useConfirm } from "@/stores/confirm-store";

export const ProductList = () => {
  const categories = useCategoriesStore((state) => state.categories);
  const openConfirm = useConfirm((state) => state.open);
  const { toggleProductDeletedAsync } = useToggleProductDeleted();

  // Custom hook for filters and pagination
  const {
    filters,
    pagination: paginationState,
    updateFilters,
    clearFilters,
    setPage,
    setLimit,
  } = useProductFilters();

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Get products data
  const { products, pagination, isFetching, error } = useGetAllProducts({
    page: paginationState.page,
    limit: paginationState.limit,
    search: filters.search,
    categoryId: filters.categoryId || undefined,
    subcategoryId: filters.subcategoryId || undefined,
    isDeleted:
      filters.deletedFilter === "all"
        ? undefined
        : filters.deletedFilter === "true",
    priceMin: filters.priceRange.min
      ? parseFloat(filters.priceRange.min)
      : undefined,
    priceMax: filters.priceRange.max
      ? parseFloat(filters.priceRange.max)
      : undefined,
    sortBy:
      (sorting[0]?.id as "name" | "price" | "created_at" | "updated_at") ||
      "created_at",
    sortOrder: sorting[0]?.desc ? "desc" : "asc",
  });

  // Event handlers
  const onUpdate = (product: ProductTable) => {};

  const onToggle = useCallback(
    async (product: ProductTable) => {
      try {
        openConfirm({
          title: product.is_deleted ? "Restore product" : "Move to Trash",
          description: product.is_deleted
            ? "Are you sure you want to restore this product?"
            : "Are you sure you want to move this product to trash?",
          onConfirm: async () => {
            await toggleProductDeletedAsync({ id: product.id });
          },
        });
      } catch (error: any) {
        toast.dismiss();
        toast.error(error?.message || "Failed to toggle product status");
      }
    },
    [toggleProductDeletedAsync, openConfirm]
  );

  const onDelete = (product: ProductTable) => {
    toast.error("Delete functionality not implemented yet");
  };

  // Create columns with handlers
  const columns = createProductColumns({ onUpdate, onDelete, onToggle });

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Error loading products: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Filters */}
      <ProductFiltersComponent
        filters={filters}
        categories={categories}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
      />

      {/* Table */}
      <ProductTableComponent
        products={products}
        columns={columns}
        pagination={pagination}
        isFetching={isFetching}
        sorting={sorting}
        setSorting={setSorting}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        page={paginationState.page}
        setPage={setPage}
        limit={paginationState.limit}
        setLimit={setLimit}
      />
    </div>
  );
};

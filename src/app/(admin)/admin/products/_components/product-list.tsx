"use client";

import React, { useCallback, useState } from "react";
import {
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import {
  useBulkProductActions,
  useDeleteProduct,
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
import { useRemoveImages } from "../../categories/hooks/custom-hook-category";
import { useModal } from "@/stores/modal-store";
import { ProductDetailCard } from "./product-details-card";
import { UpdateProductForm } from "@/components/forms/product/update-product-form";

export const ProductList = () => {
  const categories = useCategoriesStore((state) => state.categories);
  const openConfirm = useConfirm((state) => state.open);
  const openModal = useModal((state) => state.open);
  const { toggleProductDeletedAsync } = useToggleProductDeleted();
  const { removeImagesAsync } = useRemoveImages();
  const { deleteProductAsync } = useDeleteProduct();

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

  const { handleBulkDelete, handleBulkToggle } = useBulkProductActions();

  const selectedIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id]
  );

  const onBulkDelete = async () => {
    await handleBulkDelete(
      selectedIds,
      products.filter((product) => selectedIds.includes(product.id)) || [],
      () => setRowSelection({})
    );
  };

  const onBulkToggle = async () => {
    await handleBulkToggle(
      selectedIds,
      () => setRowSelection({})
    );
  };

  // Event handlers
  const onUpdate = useCallback(
    (product: ProductTable) => {
      openModal({
        children: <UpdateProductForm data={product} />,
        title: "Update Category",
        description: "Update category information",
      });
    },
    [openModal]
  );

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

  const onDelete = useCallback(
    async (product: ProductTable) => {
      try {
        openConfirm({
          title: "Permanent Deletion Warning",
          description: `Are you absolutely sure you want to permanently delete "${product.name}"? This action CANNOT be undone and will:
  - Delete associated images
  - Remove all relationships`,
          onConfirm: async () => {
            try {
              if (product.images.length > 0) {
                await removeImagesAsync({
                  publicIds: product.images.map((image) => image.public_id),
                });
              }
              await deleteProductAsync({ id: product.id });
            } catch (error: any) {
              toast.dismiss();
              toast.error(
                error?.message || "Failed to permanently delete product"
              );
            }
          },
        });
      } catch (error: any) {
        toast.dismiss();
        toast.error(error?.message || "Failed to move category to trash");
      }
    },
    [deleteProductAsync, removeImagesAsync, openConfirm]
  );

  const onView = useCallback(async (product: ProductTable) => {
    openModal({
      title: "Category Details",
      children: <ProductDetailCard product={product} />,
    });
  }, []);

  // Create columns with handlers
  const columns = createProductColumns({
    onUpdate,
    onDelete,
    onToggle,
    onView,
  });

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
        onBulkDelete={onBulkDelete}
        onBulkToggle={onBulkToggle}
      />
    </div>
  );
};

"use client";

import React, { useCallback, useState } from "react";
import {
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useCategoriesStore } from "@/stores/admin/categories-store";
import { toast } from "sonner";
import { createProductColumns } from "./product-columns";
import { ProductFiltersComponent } from "./product-filters";
import { useConfirm } from "@/stores/confirm-store";
import { useModal } from "@/stores/modal-store";
import { ProductDetailCard } from "./product-details-card";
import { UpdateProductForm } from "@/components/forms/product/update-product-form";
import { useProductFilters } from "../hooks/products/use-product-filters";
import { useDeleteImages } from "@/components/uploader/hooks/use-uploader";
import { useGetAllProducts } from "../hooks/products/use-get-all-products";
import { useToggleProductDeletedMultiple } from "../hooks/products/use-toggle-product-deleted-multiple";
import { useDeleteProductMultiple } from "../hooks/products/use-delete-product-multiple";
import { Product } from "@/queries/admin/products/types";
import { useToggleProductDeleted } from "../hooks/products/use-toggle-product-deleted";
import { useDeleteProduct } from "../hooks/products/use-delete-product";
import { ProductTable } from "./product-table";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { ErrorDisplay } from "@/components/global/error-display";

export const ProductList = () => {
  const categories = useCategoriesStore((state) => state.categories);
  const openConfirm = useConfirm((state) => state.open);
  const openModal = useModal((state) => state.open);

  const { toggleProductDeletedAsync } = useToggleProductDeleted();
  const { toggleProductDeletedMultipleAsync } =
    useToggleProductDeletedMultiple();
  const { deleteProductAsync } = useDeleteProduct();
  const { deleteProductMultipleAsync } = useDeleteProductMultiple();
  const { deleteImagesAsync } = useDeleteImages();

  const {
    filters,
    pagination: paginationState,
    updateFilters,
    clearFilters,
    setPage,
  } = useProductFilters();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Map deletedFilter to boolean/undefined
  const isDeleted =
    filters.deletedFilter === "all"
      ? undefined
      : filters.deletedFilter === "true";

  const { products, pagination, isFetching, error } = useGetAllProducts({
    page: paginationState.page,
    limit: DEFAULT_LIMIT,
    search: filters.search || undefined,
    slugCategory:
      filters.slugCategory && filters.slugCategory !== "all"
        ? filters.slugCategory
        : undefined,
    slugSubcategory:
      filters.slugSubcategory && filters.slugSubcategory !== "all"
        ? filters.slugSubcategory
        : undefined,
    isDeleted,
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

  const selectedIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id]
  );

  const handleBulkToggle = useCallback(async () => {
    if (selectedIds.length === 0) return;

    openConfirm({
      title: `Toggle ${selectedIds.length} Products`,
      description: `Are you sure you want to toggle the status of ${selectedIds.length} selected products? This will move active products to trash and restore deleted products.`,
      onConfirm: async () => {
        try {
          await toggleProductDeletedMultipleAsync({ ids: selectedIds });
          setRowSelection({});
        } catch (error: any) {
          toast.error(error?.message || "Failed to toggle products");
          console.error("Bulk toggle error:", error);
        }
      },
    });
  }, [toggleProductDeletedMultipleAsync, openConfirm, selectedIds]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;

    openConfirm({
      title: `Permanently Delete ${selectedIds.length} Products`,
      description: `Permanently delete "${selectedIds.length}" products? This cannot be undone.`,
      onConfirm: async () => {
        try {
          const allImagePublicIds: string[] = [];

          if (products) {
            products.forEach((product) => {
              if (product.images && Array.isArray(product.images)) {
                product.images.forEach((image) => {
                  if (image.public_id) {
                    allImagePublicIds.push(image.public_id);
                  }
                });
              }
            });
          }

          if (allImagePublicIds.length > 0) {
            await deleteImagesAsync({ publicIds: allImagePublicIds });
          }

          await deleteProductMultipleAsync({ ids: selectedIds });
          setRowSelection({});
        } catch (error: any) {
          toast.error(error?.message || "Failed to delete products");
          console.error("Bulk delete error:", error);
        }
      },
    });
  }, [
    deleteProductMultipleAsync,
    deleteImagesAsync,
    openConfirm,
    products,
    selectedIds,
  ]);

  const handleUpdateProduct = useCallback(
    (product: Product) => {
      openModal({
        children: <UpdateProductForm data={product} />,
        title: "Update Product",
        description: "Update product information",
      });
    },
    [openModal]
  );

  const handleToggleProduct = useCallback(
    async (product: Product) => {
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

  const handleDeleteProduct = useCallback(
    async (product: Product) => {
      try {
        openConfirm({
          title: "Permanent Deletion Warning",
          description: `Permanently delete "${product.name}"? This cannot be undone.`,
          onConfirm: async () => {
            try {
              if (product.images?.length > 0) {
                await deleteImagesAsync({
                  publicIds: product.images
                    .map((image) => image.public_id)
                    .filter(Boolean),
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
        toast.error(error?.message || "Failed to delete product");
      }
    },
    [deleteProductAsync, deleteImagesAsync, openConfirm]
  );

  const handleViewProduct = useCallback(
    (product: Product) => {
      openModal({
        title: "Product Details",
        children: <ProductDetailCard product={product} />,
      });
    },
    [openModal]
  );

  const columns = createProductColumns({
    onUpdate: handleUpdateProduct,
    onDelete: handleDeleteProduct,
    onToggle: handleToggleProduct,
    onView: handleViewProduct,
  });

  if (error) <ErrorDisplay errorMessage={error.message} />;

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
      <ProductTable
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
        onBulkDelete={handleBulkDelete}
        onBulkToggle={handleBulkToggle}
      />
    </div>
  );
};

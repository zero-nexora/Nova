"use client";

import { useCallback } from "react";
import { createProductColumns } from "./product-columns";
import { ProductFiltersComponent } from "./product-filters";
import { ProductTable } from "./product-table";
import { ProductDetailCard } from "./product-details-card";
import { UpdateProductForm } from "@/components/forms/product/update-product-form";

import { useConfirm } from "@/stores/confirm-store";
import { useModal } from "@/stores/modal-store";
import { useDeleteImages } from "@/components/uploader/hooks/use-uploader";
import { useToggleProductDeletedMultiple } from "../hooks/products/use-toggle-product-deleted-multiple";
import { useDeleteProductMultiple } from "../hooks/products/use-delete-product-multiple";
import { useToggleProductDeleted } from "../hooks/products/use-toggle-product-deleted";
import { useDeleteProduct } from "../hooks/products/use-delete-product";
import { useProductFilters } from "../hooks/products/use-product-fillters";
import { useGetAllCategories } from "../../categories/hooks/categories/use-get-all-categories";

import { ProductResponse } from "@/queries/admin/products/types";
import { extractAllImagePublicIds } from "@/lib/utils";

interface ProductSectionProps {
  products: ProductResponse[];
  totalProducts: number;
  currentPage: number;
  pageSize: number;
  isRefetching: boolean;
}

export const ProductSection = ({
  products,
  currentPage,
  pageSize,
  totalProducts,
  isRefetching,
}: ProductSectionProps) => {
  const { filters } = useProductFilters();
  const { categories } = useGetAllCategories();
  const openConfirm = useConfirm((state) => state.open);
  const openModal = useModal((state) => state.open);

  const { toggleProductDeletedAsync } = useToggleProductDeleted();
  const { toggleProductDeletedMultipleAsync } =
    useToggleProductDeletedMultiple();
  const { deleteProductAsync } = useDeleteProduct();
  const { deleteProductMultipleAsync } = useDeleteProductMultiple();
  const { deleteImagesAsync } = useDeleteImages();

  const handleBulkToggle = useCallback(
    async (selectedIds: string[]) => {
      if (selectedIds.length === 0) return;

      openConfirm({
        title: `Toggle ${selectedIds.length} Products`,
        description: `Are you sure you want to toggle the status of ${selectedIds.length} selected products? This will move active products to trash and restore deleted products.`,
        onConfirm: async () => {
          await toggleProductDeletedMultipleAsync({ ids: selectedIds });
        },
      });
    },
    [toggleProductDeletedMultipleAsync, openConfirm]
  );

  const handleBulkDelete = useCallback(
    async (selectedProducts: ProductResponse[]) => {
      if (selectedProducts.length === 0) return;

      const selectedIds = selectedProducts.map((p) => p.id);

      openConfirm({
        title: `Permanently Delete ${selectedIds.length} Products`,
        description: `Permanently delete ${selectedIds.length} products? This cannot be undone.`,
        onConfirm: async () => {
          const allImagePublicIds: string[] =
            extractAllImagePublicIds(selectedProducts);

          if (allImagePublicIds.length > 0) {
            await deleteImagesAsync({ publicIds: allImagePublicIds });
          }

          await deleteProductMultipleAsync({ ids: selectedIds });
        },
      });
    },
    [deleteProductMultipleAsync, deleteImagesAsync, openConfirm]
  );

  const handleUpdateProduct = useCallback(
    (product: ProductResponse) => {
      openModal({
        children: <UpdateProductForm data={product} />,
        title: "Update Product",
        description: "Update product information",
      });
    },
    [openModal]
  );

  const handleToggleProduct = useCallback(
    async (product: ProductResponse) => {
      openConfirm({
        title: product.is_deleted ? "Restore product" : "Move to Trash",
        description: product.is_deleted
          ? "Are you sure you want to restore this product?"
          : "Are you sure you want to move this product to trash?",
        onConfirm: async () => {
          await toggleProductDeletedAsync({ id: product.id });
        },
      });
    },
    [toggleProductDeletedAsync, openConfirm]
  );

  const handleDeleteProduct = useCallback(
    async (product: ProductResponse) => {
      openConfirm({
        title: "Permanent Deletion Warning",
        description: `Permanently delete "${product.name}"? This cannot be undone.`,
        onConfirm: async () => {
          if (product.images && product.images.length > 0) {
            await deleteImagesAsync({
              publicIds: product.images
                .map((image) => image.public_id)
                .filter((id): id is string => Boolean(id)),
            });
          }

          await deleteProductAsync({ id: product.id });
        },
      });
    },
    [deleteProductAsync, deleteImagesAsync, openConfirm]
  );

  const handleViewProduct = useCallback(
    (product: ProductResponse) => {
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

  return (
    <div className="space-y-6">
      <ProductFiltersComponent filters={filters} categories={categories} />

      <ProductTable
        products={products}
        columns={columns}
        totalProducts={totalProducts}
        currentPage={currentPage}
        pageSize={pageSize}
        onBulkDelete={handleBulkDelete}
        onBulkToggle={handleBulkToggle}
        isRefetching={isRefetching}
      />
    </div>
  );
};

"use client";

import React, { useCallback } from "react";
import { useCategoriesStore } from "@/stores/admin/categories-store";
import { toast } from "sonner";
import { createProductColumns } from "./product-columns";
import { ProductFiltersComponent } from "./product-filters";
import { useConfirm } from "@/stores/confirm-store";
import { useModal } from "@/stores/modal-store";
import { ProductDetailCard } from "./product-details-card";
import { UpdateProductForm } from "@/components/forms/product/update-product-form";
import { useDeleteImages } from "@/components/uploader/hooks/use-uploader";
import { useGetAllProducts } from "../hooks/products/use-get-all-products";
import { useToggleProductDeletedMultiple } from "../hooks/products/use-toggle-product-deleted-multiple";
import { useDeleteProductMultiple } from "../hooks/products/use-delete-product-multiple";
import { Product } from "@/queries/admin/products/types";
import { useToggleProductDeleted } from "../hooks/products/use-toggle-product-deleted";
import { useDeleteProduct } from "../hooks/products/use-delete-product";
import { ProductTable } from "./product-table";
import { Error } from "@/components/global/error";
import { useProductFilters } from "../hooks/products/use-product-fillters";

export const ProductList = () => {
  const { filters } = useProductFilters();
  const categories = useCategoriesStore((state) => state.categories);
  const openConfirm = useConfirm((state) => state.open);
  const openModal = useModal((state) => state.open);

  const { toggleProductDeletedAsync } = useToggleProductDeleted();
  const { toggleProductDeletedMultipleAsync } =
    useToggleProductDeletedMultiple();
  const { deleteProductAsync } = useDeleteProduct();
  const { deleteProductMultipleAsync } = useDeleteProductMultiple();
  const { deleteImagesAsync } = useDeleteImages();

  // Map isDeleted to boolean/undefined for API
  const { products, pagination, isFetching, error } = useGetAllProducts({
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    slugCategory: filters.slugCategory || undefined,
    slugSubcategory: filters.slugSubcategory || undefined,
    isDeleted: filters.isDeleted,
    priceMin: filters.priceMin || undefined,
    priceMax: filters.priceMax || undefined,
  });

  const handleBulkToggle = useCallback(async () => {
    const selectedIds = Object.keys(
      products.reduce((acc, product) => {
        if (product.id) acc[product.id] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );

    if (selectedIds.length === 0) return;

    openConfirm({
      title: `Toggle ${selectedIds.length} Products`,
      description: `Are you sure you want to toggle the status of ${selectedIds.length} selected products? This will move active products to trash and restore deleted products.`,
      onConfirm: async () => {
        try {
          await toggleProductDeletedMultipleAsync({ ids: selectedIds });
        } catch (error: any) {
          toast.error(error?.message || "Failed to toggle products");
          console.error("Bulk toggle error:", error);
        }
      },
    });
  }, [toggleProductDeletedMultipleAsync, openConfirm, products]);

  const handleBulkDelete = useCallback(async () => {
    const selectedIds = Object.keys(
      products.reduce((acc, product) => {
        if (product.id) acc[product.id] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );

    if (selectedIds.length === 0) return;

    openConfirm({
      title: `Permanently Delete ${selectedIds.length} Products`,
      description: `Permanently delete "${selectedIds.length}" products? This cannot be undone.`,
      onConfirm: async () => {
        try {
          const allImagePublicIds: string[] = [];
          products.forEach((product) => {
            if (product.images && Array.isArray(product.images)) {
              product.images.forEach((image) => {
                if (image.public_id) {
                  allImagePublicIds.push(image.public_id);
                }
              });
            }
          });

          if (allImagePublicIds.length > 0) {
            await deleteImagesAsync({ publicIds: allImagePublicIds });
          }

          await deleteProductMultipleAsync({ ids: selectedIds });
        } catch (error: any) {
          toast.error(error?.message || "Failed to delete products");
          console.error("Bulk delete error:", error);
        }
      },
    });
  }, [deleteProductMultipleAsync, deleteImagesAsync, openConfirm, products]);

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
                    .filter((id): id is string => Boolean(id)),
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

  if (error) return <Error/>;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Filters */}
      <ProductFiltersComponent filters={filters} categories={categories} />

      {/* Table */}
      <ProductTable
        products={products}
        columns={columns}
        pagination={pagination}
        isFetching={isFetching}
        onBulkDelete={handleBulkDelete}
        onBulkToggle={handleBulkToggle}
      />
    </div>
  );
};

import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";
import { GetAllProductsSchema } from "@/queries/admin/products/types";
import { useProductAttributesStore } from "@/stores/admin/product-attribute-store";
import { useTRPC } from "@/trpc/client";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PaginationState, ProductFilters, ProductTable } from "./types";
import { useConfirm } from "@/stores/confirm-store";
import { useRemoveImages } from "../../categories/hooks/custom-hook-category";

export function useGetAllProducts(
  params: z.infer<typeof GetAllProductsSchema> = {
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    sortBy: "created_at",
    sortOrder: "asc",
  }
) {
  const trpc = useTRPC();

  const { data, error, isPending, isFetching } = useQuery({
    ...trpc.admin.productsRouter.getAll.queryOptions(params),
    placeholderData: keepPreviousData,
  });

  return {
    error,
    products: data?.products ?? [],
    pagination: data?.pagination ?? null,
    isPending,
    isFetching,
  };
}

export function useGetProductById(id: string, enabled: boolean = true) {
  const trpc = useTRPC();

  const { data, error, isPending } = useQuery({
    ...trpc.admin.productsRouter.getById.queryOptions({ id }),
    enabled: enabled && !!id,
    retry: (failureCount, error: any) => {
      if (error?.data?.code === "NOT_FOUND") return false;
      return failureCount < 2;
    },
  });

  return {
    product: data,
    error,
    isPending,
  };
}

// Get Product by Slug
export function useGetProductBySlug(slug: string, enabled: boolean = true) {
  const trpc = useTRPC();

  const { data, error, isPending } = useQuery({
    ...trpc.admin.productsRouter.getBySlug.queryOptions({ slug }),
    enabled: enabled && !!slug,
    retry: (failureCount, error: any) => {
      if (error?.data?.code === "NOT_FOUND") return false;
      return failureCount < 2;
    },
  });

  return {
    product: data,
    error,
    isPending,
  };
}

// Create Product
export function useCreateProduct() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.admin.productsRouter.create.mutationOptions(),
    onSuccess: (data) => {
      toast.success(data.message || "Product created successfully");

      // Invalidate and refetch product lists
      queryClient.invalidateQueries(
        trpc.admin.productsRouter.getAll.queryOptions({
          limit: DEFAULT_LIMIT,
          page: DEFAULT_PAGE,
        })
      );
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to create product";
      toast.error(message);

      if (error?.data?.code === "CONFLICT") {
        toast.error("Product with this name/slug already exists");
      }
    },
  });

  return {
    createProduct: mutation.mutate,
    createProductAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// Update Product
export function useUpdateProduct() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.admin.productsRouter.update.mutationOptions(),
    onSuccess: (data) => {
      toast.success(data.message || "Product updated successfully");

      queryClient.invalidateQueries(
        trpc.admin.productsRouter.getAll.queryOptions({
          limit: DEFAULT_LIMIT,
          page: DEFAULT_PAGE,
        })
      );
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to update product";
      toast.error(message);

      if (error?.data?.code === "CONFLICT") {
        toast.error("Product with this name/slug already exists");
      }
      if (error?.data?.code === "NOT_FOUND") {
        toast.error("Product not found or has been deleted");
      }
    },
  });

  return {
    updateProduct: mutation.mutate,
    updateProductAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

// Toggle Product Deleted Status (Soft Delete/Restore)
export function useToggleProductDeleted() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.productsRouter.toggleDeleted.mutationOptions({
      onSuccess: (data) => {
        const message = data.product?.is_deleted
          ? `Product moved to trash successfully`
          : `Product restored successfully`;
        toast.success(data.message || message);

        queryClient.invalidateQueries(
          trpc.admin.productsRouter.getAll.queryOptions({
            limit: DEFAULT_LIMIT,
            page: DEFAULT_PAGE,
          })
        );
      },
      onError: (error) => {
        toast.error(error.message || "Failed to toggle product status");
      },
    })
  );

  return {
    toggleProductDeleted: mutate,
    toggleProductDeletedAsync: mutateAsync,
    isPending,
    error,
  };
}

export function useDeleteProduct() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.productsRouter.delete.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message || "Product permanently deleted");

        // Remove product detail from cache
        queryClient.invalidateQueries(
          trpc.admin.productsRouter.getAll.queryOptions({
            limit: DEFAULT_LIMIT,
            page: DEFAULT_PAGE,
          })
        );
      },
      onError: (error: any) => {
        const message = error?.message || "Failed to delete product";
        toast.error(message);

        if (error?.data?.code === "PRECONDITION_FAILED") {
          toast.error(
            "Cannot delete: Product has order history. Use soft delete instead."
          );
        }
      },
    })
  );

  return {
    deleteProduct: mutate,
    deleteProductAsync: mutateAsync,
    isPending,
    error,
  };
}

export function useGetAllProductAttributes() {
  const setProductAttributes = useProductAttributesStore(
    (state) => state.setProductAttributes
  );
  const setLoading = useProductAttributesStore((state) => state.setLoading);
  const setError = useProductAttributesStore((state) => state.setError);
  const trpc = useTRPC();
  const { data, isPending, error } = useQuery({
    ...trpc.admin.productsRouter.getAllProductAttributes.queryOptions(),
  });

  useEffect(() => {
    if (data) setProductAttributes(data);
  }, [data]);

  useEffect(() => {
    setLoading(isPending);
  }, [isPending]);

  useEffect(() => {
    if (error) setError(error);
  }, [error]);

  return {
    productAttributes: data,
    isPending,
    error,
  };
}

export const useProductFilters = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    categoryId: "",
    subcategoryId: "",
    deletedFilter: "false",
    priceRange: { min: "", max: "" },
  });

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
  });

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      categoryId: "",
      subcategoryId: "",
      deletedFilter: "false",
      priceRange: { min: "", max: "" },
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  return {
    filters,
    pagination,
    updateFilters,
    clearFilters,
    setPage,
    setLimit,
  };
};

export const useDeleteProductImages = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, error, isPending } = useMutation(
    trpc.admin.productsRouter.deleteProductImages.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.success || "Product image deleted successfully");

        queryClient.invalidateQueries(
          trpc.admin.productsRouter.getAll.queryOptions({
            limit: DEFAULT_LIMIT,
            page: DEFAULT_PAGE,
          })
        );
      },

      onError: (error: any) => {
        const message = error?.message || "Failed to image delete product";
        toast.error(message);
      },
    })
  );

  return {
    deleteProductImagesAsync: mutateAsync,
    deleteProductImages: mutate,
    error,
    isPending,
  };
};

export const useBulkProductActions = () => {
  const openConfirm = useConfirm((state) => state.open);
  const { toggleProductDeletedAsync } = useToggleProductDeleted();
  const { deleteProductAsync } = useDeleteProduct();
  const { removeImagesAsync } = useRemoveImages();

  const handleBulkToggle = useCallback(
    async (selectedIds: string[], onComplete?: () => void) => {
      if (selectedIds.length === 0) return;

      openConfirm({
        title: `Toggle ${selectedIds.length} Products`,
        description: `Are you sure you want to toggle the status of ${selectedIds.length} selected products? This will move active products to trash and restore deleted products.`,
        onConfirm: async () => {
          try {
            const promises = selectedIds.map((id) => {
              toggleProductDeletedAsync({ id });
            });

            await Promise.all(promises);
            toast.success(
              `Successfully toggled ${selectedIds.length} products`
            );

            // Clear selection after successful operation
            onComplete?.();
          } catch (error: any) {
            toast.error(error?.message || "Failed to toggle products");
            console.error("Bulk toggle error:", error);
          }
        },
      });
    },
    [toggleProductDeletedAsync, openConfirm]
  );

  const handleBulkDelete = useCallback(
    async (
      selectedIds: string[],
      products?: ProductTable[],
      onComplete?: () => void
    ) => {
      if (selectedIds.length === 0) return;

      openConfirm({
        title: `Permanently Delete ${selectedIds.length} Products`,
        description: `Are you absolutely sure you want to permanently delete ${selectedIds.length} selected products? This action CANNOT be undone and will: • Delete all associated images • Remove all relationships • Permanently remove the products from the database`,
        onConfirm: async () => {
          try {
            // Step 1: Collect all image public_ids from products
            const allImagePublicIds: string[] = [];

            if (products) {
              products.forEach((product) => {
                // Giả sử product có field images là array chứa objects với public_id
                if (product.images && Array.isArray(product.images)) {
                  product.images.forEach((image) => {
                    if (image.public_id) {
                      allImagePublicIds.push(image.public_id);
                    }
                  });
                }
              });
            }

            // Step 2: Remove images from cloud storage first
            if (allImagePublicIds.length > 0) {
              await removeImagesAsync({ publicIds: allImagePublicIds });
              console.log(
                `Removed ${allImagePublicIds.length} images from cloud storage`
              );
            }

            // Step 3: Delete products from database
            const deletePromises = selectedIds.map((id) =>
              deleteProductAsync({ id })
            );

            await Promise.all(deletePromises);
            toast.success(
              `Successfully deleted ${selectedIds.length} products and ${allImagePublicIds.length} associated images`
            );

            // Clear selection after successful operation
            onComplete?.();
          } catch (error: any) {
            toast.error(error?.message || "Failed to delete products");
            console.error("Bulk delete error:", error);
          }
        },
      });
    },
    [deleteProductAsync, removeImagesAsync, openConfirm]
  );

  return {
    handleBulkToggle,
    handleBulkDelete,
  };
};

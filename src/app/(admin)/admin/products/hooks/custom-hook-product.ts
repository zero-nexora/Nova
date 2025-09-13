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
import { PaginationState, ProductFilters } from "./types";

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

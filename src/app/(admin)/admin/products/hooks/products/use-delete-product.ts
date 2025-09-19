"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteProduct() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.productsRouter.delete.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Product "${data.data.name}" deleted permanently`);

        queryClient.invalidateQueries(
          trpc.admin.productsRouter.getAll.queryOptions({
            limit: DEFAULT_LIMIT,
            page: DEFAULT_PAGE,
          })
        );
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete product");
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
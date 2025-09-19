"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteProductMultiple() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, error, isPending } = useMutation(
    trpc.admin.productsRouter.deleteMultiple.mutationOptions({
      onSuccess: (data) => {
        const { count, notFoundIds } = data;

        if (count > 0) {
          toast.success(`${count} product(s) deleted permanently`);
        }

        if (notFoundIds.length > 0) {
          toast.warning(`${notFoundIds.length} product(s) not found`);
        }

        if (count === 0 && notFoundIds.length > 0) {
          toast.error("No products found to delete");
        }

        queryClient.invalidateQueries(
          trpc.admin.productsRouter.getAll.queryOptions({
            limit: DEFAULT_LIMIT,
            page: DEFAULT_PAGE,
          })
        );
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete products");
      },
    })
  );

  return {
    deleteProductMultiple: mutate,
    deleteProductMultipleAsync: mutateAsync,
    error,
    isPending,
  };
}

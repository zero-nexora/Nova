"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateProduct() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation(
    trpc.admin.productsRouter.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Product "${data.data.name}" created successfully`);

        queryClient.invalidateQueries(
          trpc.admin.productsRouter.getAll.queryOptions({
            limit: DEFAULT_LIMIT,
            page: DEFAULT_PAGE,
          })
        );
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to create product");
      },
    })
  );

  return {
    createProduct: mutation.mutate,
    createProductAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

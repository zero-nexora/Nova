"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteProductImages() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, error, isPending } = useMutation(
    trpc.admin.productsRouter.deleteProductImages.mutationOptions({
      onSuccess: (data) => {
        toast.success(`${data.deletedCount} image(s) deleted successfully`);

        queryClient.invalidateQueries(
          trpc.admin.productsRouter.getAll.queryOptions({
            limit: DEFAULT_LIMIT,
            page: DEFAULT_PAGE,
          })
        );
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete images");
      },
    })
  );

  return {
    deleteProductImages: mutate,
    deleteProductImagesAsync: mutateAsync,
    isPending,
    error,
  };
}

"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleProductDeleted() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.productsRouter.toggleDeleted.mutationOptions({
      onSuccess: (data) => {
        const message = data.data.is_deleted
          ? `Product "${data.data.name}" moved to trash successfully`
          : `Product "${data.data.name}" restored successfully`;
        toast.success(message);

        queryClient.invalidateQueries(
          trpc.admin.productsRouter.getAll.queryOptions({
            limit: DEFAULT_LIMIT,
            page: DEFAULT_PAGE,
          })
        );
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to toggle product status");
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

"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_LIMIT } from "@/lib/constants";

export function useDeleteWishlistMultiple() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation(
    trpc.client.wishlistsRouter.deleteMultiple.mutationOptions({
      onSuccess: (data) => {
        const message = `Successfully deleted ${
          data.deletedCount
        } wishlist item${data.deletedCount !== 1 ? "s" : ""}`;
        queryClient.invalidateQueries(
          trpc.client.productsRouterClient.getAll.infiniteQueryOptions({
            limit: DEFAULT_LIMIT,
            sortOrder: "desc",
            sortBy: "curated",
          })
        );
        queryClient.invalidateQueries(
          trpc.client.usersRouter.getCurrentUser.queryOptions()
        );
        toast.success(message);
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete wishlist items");
      },
    })
  );

  return {
    deleteWishlistMultiple: mutate,
    deleteWishlistMultipleAsync: mutateAsync,
    isPending,
    error,
  };
}

"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_LIMIT } from "@/lib/constants";

export function useToggleWishlist() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation(
    trpc.client.wishlistsRouter.toggle.mutationOptions({
      onSuccess: (data) => {
        const message =
          data.action === "added"
            ? "Product added to wishlist successfully"
            : "Product removed from wishlist successfully";
        toast.success(message);
        queryClient.invalidateQueries(
          trpc.client.productsRouterClient.getBySlug.queryOptions({
            slug: data.data,
          })
        );
        queryClient.invalidateQueries(
          trpc.client.usersRouter.getCurrentUser.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.client.productsRouterClient.getAll.infiniteQueryOptions({
            wishlist: true,
            limit: DEFAULT_LIMIT,
          })
        );
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useToggleWishlist ", error.message);
      },
    })
  );

  return {
    toggleWishlist: mutate,
    toggleWishlistAsync: mutateAsync,
    isPending,
    error,
  };
}

"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
        queryClient.invalidateQueries(
          trpc.client.productsRouterClient.getBySlug.queryOptions({
            slug: data.data,
          })
        );
        queryClient.invalidateQueries(
          trpc.client.usersRouter.getCurrentUser.queryOptions()
        );
        toast.success(message);
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to toggle wishlist");
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

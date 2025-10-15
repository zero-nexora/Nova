"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAddToCart() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation(
    trpc.client.cartsRouter.addToCart.mutationOptions({
      onSuccess: () => {
        toast.success("Product added to cart successfully");
        queryClient.invalidateQueries(
          trpc.client.usersRouter.getCurrentUser.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.client.cartsRouter.getCart.queryOptions()
        );
      },
      onError: (error) => {
        toast.error("Something went wrong.");
        console.log("Failed to useAddToCart ", error.message);
      },
    })
  );

  return {
    addToCart: mutate,
    addToCartAsync: mutateAsync,
    isPending,
    error,
  };
}

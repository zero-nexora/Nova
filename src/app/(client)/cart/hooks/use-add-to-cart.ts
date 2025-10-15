"use client";

import { useCartStore } from "@/stores/client/carts-store";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAddToCart() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const addToCart = useCartStore((state) => state.addToCart);

  const { mutate, mutateAsync, isPending, error } = useMutation(
    trpc.client.cartsRouter.addToCart.mutationOptions({
      onSuccess: (data) => {
        addToCart(data);
        queryClient.invalidateQueries(trpc.client.usersRouter.getCurrentUser.queryOptions());
        toast.success("Product added to cart successfully");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to add product to cart");
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

"use client";

import { useCartStore } from "@/stores/client/carts-store";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAddToCart() {
  const trpc = useTRPC();

  const addToCart = useCartStore((state) => state.addToCart);

  const { mutate, mutateAsync, isPending, error } = useMutation(
    trpc.client.cartsRouter.addToCart.mutationOptions({
      onSuccess: (data) => {
        addToCart(data);
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

"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAddToCart() {
  const trpc = useTRPC();

  const { mutate, mutateAsync, isPending, error } = useMutation(
    trpc.client.cartsRouter.addToCart.mutationOptions({
      onSuccess: () => {
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

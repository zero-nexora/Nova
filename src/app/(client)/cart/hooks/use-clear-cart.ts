"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useClearCart() {
  const trpc = useTRPC();

  const { mutate, mutateAsync, isPending, error } = useMutation(
    trpc.client.cartsRouter.clearCart.mutationOptions({
      onSuccess: () => {
        toast.success("Cart cleared successfully");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to clear cart");
      },
    })
  );

  return {
    clearCart: mutate,
    clearCartAsync: mutateAsync,
    isPending,
    error,
  };
}

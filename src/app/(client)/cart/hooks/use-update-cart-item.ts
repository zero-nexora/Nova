"use client";

import { useCartStore } from "@/stores/client/carts-store";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateCartItem() {
  const trpc = useTRPC();
  const rollbackCartItemQuantity = useCartStore(
    (state) => state.rollbackCartItemQuantity
  );

  const { mutate, mutateAsync, isPending, error } = useMutation(
    trpc.client.cartsRouter.updateCartItem.mutationOptions({
      onError: (err, variables) => {
        rollbackCartItemQuantity(variables.cartItemId, variables.quantity);
        toast.error(err.message || "Failed to update cart");
      },
    })
  );

  return {
    updateCartItem: mutate,
    updateCartItemAsync: mutateAsync,
    isPending,
    error,
  };
}

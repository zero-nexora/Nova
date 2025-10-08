"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteCartItem() {
  const trpc = useTRPC();

  const { mutate, mutateAsync, isPending, error } = useMutation(
    trpc.client.cartsRouter.deleteCartItem.mutationOptions({
      onSuccess: () => {
        toast.success("Item removed from cart");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to remove item");
      },
    })
  );

  return {
    deleteCartItem: mutate,
    deleteCartItemAsync: mutateAsync,
    isPending,
    error,
  };
}

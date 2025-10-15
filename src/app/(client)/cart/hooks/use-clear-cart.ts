"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useClearCart() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation(
    trpc.client.cartsRouter.clearCart.mutationOptions({
      onError: (err) => {
        queryClient.invalidateQueries(
          trpc.client.usersRouter.getCurrentUser.queryOptions()
        );
        toast.error(err.message || "Failed to clear cart");
        queryClient.invalidateQueries(
          trpc.client.cartsRouter.getCart.queryOptions()
        );
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

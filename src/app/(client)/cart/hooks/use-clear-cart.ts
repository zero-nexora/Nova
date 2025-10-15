"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useClearCart() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation(
    trpc.client.cartsRouter.clearCart.mutationOptions({
      onSuccess: () => {
        toast.error("Clear cart successfully.");
        queryClient.invalidateQueries(
          trpc.client.usersRouter.getCurrentUser.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.client.cartsRouter.getCart.queryOptions()
        );
      },
      onError: (error) => {
        toast.error("Something went wrong.");
        console.log("Failed to useClearCart ", error.message);
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

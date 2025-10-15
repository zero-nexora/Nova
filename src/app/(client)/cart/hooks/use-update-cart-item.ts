"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateCartItem() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation(
    trpc.client.cartsRouter.updateCartItem.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.client.cartsRouter.getCart.queryOptions()
        );
      },
      onError: (error) => {
        toast.error("Something went wrong.");
        console.log("Failed to useUpdateCartItem ", error.message);
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

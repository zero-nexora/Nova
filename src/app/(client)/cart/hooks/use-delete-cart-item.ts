"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteCartItem() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation(
    trpc.client.cartsRouter.deleteCartItem.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.client.usersRouter.getCurrentUser.queryOptions());
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

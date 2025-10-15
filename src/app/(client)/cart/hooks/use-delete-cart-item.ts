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
        toast.success("Item removed from cart");
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
    deleteCartItem: mutate,
    deleteCartItemAsync: mutateAsync,
    isPending,
    error,
  };
}

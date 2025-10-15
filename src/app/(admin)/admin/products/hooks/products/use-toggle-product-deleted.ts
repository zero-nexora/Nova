"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateProducts } from "./use-invalidate-products";

export function useToggleProductDeleted() {
  const trpc = useTRPC();
  const { invalidate } = useInvalidateProducts();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.productsRouter.toggleDeleted.mutationOptions({
      onSuccess: (data) => {
        const message =
          data.action === "deleted"
            ? `Product moved to trash successfully`
            : `Product restored successfully`;
        toast.success(message);

        invalidate();
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useToggleProductDeleted ", error.message);
      },
    })
  );

  return {
    toggleProductDeleted: mutate,
    toggleProductDeletedAsync: mutateAsync,
    isPending,
    error,
  };
}

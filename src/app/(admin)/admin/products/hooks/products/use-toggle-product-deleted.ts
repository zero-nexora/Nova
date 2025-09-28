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
        const message = data.data.is_deleted
          ? `Product "${data.data.name}" moved to trash successfully`
          : `Product "${data.data.name}" restored successfully`;
        toast.success(message);

        invalidate();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to toggle product status");
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

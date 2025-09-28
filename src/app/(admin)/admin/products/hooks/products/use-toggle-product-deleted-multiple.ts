"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateProducts } from "./use-invalidate-products";

export function useToggleProductDeletedMultiple() {
  const trpc = useTRPC();
  const { invalidate } = useInvalidateProducts();

  const { mutate, mutateAsync, error, isPending } = useMutation(
    trpc.admin.productsRouter.toggleDeletedMultiple.mutationOptions({
      onSuccess: (data) => {
        const { count, skippedIds, notFoundIds } = data;

        if (count > 0) {
          toast.success(`${count} product(s) status changed successfully`);
        }

        if (skippedIds.length > 0) {
          toast.warning(
            `${skippedIds.length} product(s) skipped due to deleted category/subcategory`
          );
        }

        if (notFoundIds.length > 0) {
          toast.error(`${notFoundIds.length} product(s) not found`);
        }

        if (count === 0 && skippedIds.length === 0 && notFoundIds.length > 0) {
          toast.error("No products found to update");
        }

        invalidate();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to toggle products status");
      },
    })
  );

  return {
    toggleProductDeletedMultiple: mutate,
    toggleProductDeletedMultipleAsync: mutateAsync,
    isPending,
    error,
  };
}

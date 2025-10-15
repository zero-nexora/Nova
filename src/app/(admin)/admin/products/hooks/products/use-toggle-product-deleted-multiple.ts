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
        const { updated, notFound } = data;

        if (updated) {
          toast.success(`${updated} product(s) status changed successfully`);
        }

        if (notFound) {
          toast.error(`${notFound} product(s) not found`);
        }

        invalidate();
      },
      onError: (error) => {
        toast.error("Something went wrong.");
        console.log(
          "Failed to useToggleProductDeletedMultiple ",
          error.message
        );
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

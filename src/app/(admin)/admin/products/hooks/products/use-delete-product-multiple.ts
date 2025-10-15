"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateProducts } from "./use-invalidate-products";

export function useDeleteProductMultiple() {
  const trpc = useTRPC();
  const { invalidate } = useInvalidateProducts();

  const { mutate, mutateAsync, error, isPending } = useMutation(
    trpc.admin.productsRouter.deleteMultiple.mutationOptions({
      onSuccess: (data) => {
        const { deleted, notFound } = data;

        if (deleted) {
          toast.success(`${deleted} product(s) deleted.`);
        }
        if (notFound) {
          toast.warning(`${notFound} product(s) not found.`);
        }

        invalidate();
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useDeleteProductMultiple ", error.message);
      },
    })
  );

  return {
    deleteProductMultiple: mutate,
    deleteProductMultipleAsync: mutateAsync,
    error,
    isPending,
  };
}

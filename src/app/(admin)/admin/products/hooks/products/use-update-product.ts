"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateProducts } from "./use-invalidate-products";

export function useUpdateProduct() {
  const trpc = useTRPC();
  const { invalidate } = useInvalidateProducts();

  const mutation = useMutation(
    trpc.admin.productsRouter.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Product "${data.data.name}" updated successfully`);

        invalidate();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to update product");
      },
    })
  );

  return {
    updateProduct: mutation.mutate,
    updateProductAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

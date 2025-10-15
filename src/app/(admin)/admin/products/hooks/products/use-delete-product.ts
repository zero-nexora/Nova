"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateProducts } from "./use-invalidate-products";

export function useDeleteProduct() {
  const trpc = useTRPC();
  const { invalidate } = useInvalidateProducts();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.productsRouter.delete.mutationOptions({
      onSuccess: () => {
        toast.success(`Product deleted permanently`);

        invalidate();
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useDeleteProduct ", error.message);
      },
    })
  );

  return {
    deleteProduct: mutate,
    deleteProductAsync: mutateAsync,
    isPending,
    error,
  };
}

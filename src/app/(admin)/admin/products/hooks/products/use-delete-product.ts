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
      onSuccess: (data) => {
        toast.success(`Product "${data.data.name}" deleted permanently`);

        invalidate();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete product");
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

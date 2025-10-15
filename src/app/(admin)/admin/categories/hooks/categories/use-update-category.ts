"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, error, isPending } = useMutation(
    trpc.admin.categoriesRouter.update.mutationOptions({
      onSuccess: () => {
        toast.success(`Category updated successfully`);
        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useUpdateCategory ", error.message);
      },
    })
  );

  return {
    updateCategory: mutate,
    updateCategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

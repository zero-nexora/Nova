"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateSubcategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.subcategoriesRouter.update.mutationOptions({
      onSuccess: () => {
        toast.success(`Subcategory updated successfully`);
        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useUpdateSubcategory ", error.message);
      },
    })
  );

  return {
    updateSubcategory: mutate,
    updateSubcategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

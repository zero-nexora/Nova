"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateSubcategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.subcategoriesRouter.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Subcategory "${data.name}" updated successfully`);
        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update subcategory");
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
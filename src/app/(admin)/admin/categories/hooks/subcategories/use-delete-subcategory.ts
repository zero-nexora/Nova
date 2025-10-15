"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteSubcategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.subcategoriesRouter.delete.mutationOptions({
      onSuccess: () => {
        toast.success(`Subcategory deleted permanently`);

        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useDeleteSubcategory ", error.message);
      },
    })
  );

  return {
    deleteSubcategory: mutate,
    deleteSubcategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

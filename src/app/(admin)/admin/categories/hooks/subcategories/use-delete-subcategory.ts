"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteSubcategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.subcategoriesRouter.delete.mutationOptions({
      onSuccess: (data) => {
        if (data.success) {
          toast.success(
            `Subcategory "${data.data.name}" has been deleted successfully`
          );
        }

        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete subcategory");
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

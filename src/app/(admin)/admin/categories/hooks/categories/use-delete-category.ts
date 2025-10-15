"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.categoriesRouter.delete.mutationOptions({
      onSuccess: () => {
        toast.success(`Category deleted permanently`);

        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useDeleteCategory ", error.message);
      },
    })
  );

  return {
    deleteCategory: mutate,
    deleteCategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

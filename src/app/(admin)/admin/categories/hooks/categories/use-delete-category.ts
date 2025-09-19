"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.categoriesRouter.delete.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          `Category "${data.data.name}" has been deleted successfully`
        );

        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete category");
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

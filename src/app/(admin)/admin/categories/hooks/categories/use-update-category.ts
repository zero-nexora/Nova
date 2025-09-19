"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, error, isPending } = useMutation(
    trpc.admin.categoriesRouter.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Category ${data.name} updated successfully`);
        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update category");
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

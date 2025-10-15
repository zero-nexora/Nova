"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteCategoryMultiple() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.categoriesRouter.deleteMultiple.mutationOptions({
      onSuccess: (data) => {
        const { deleted, notFound } = data;

        if (deleted) {
          toast.success(`${deleted} category(s) deleted.`);
        }
        if (notFound) {
          toast.warning(`${notFound} category(s) not found.`);
        }

        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useDeleteCategoryMultiple ", error.message);
      },
    })
  );

  return {
    deleteCategoryMultiple: mutate,
    deleteCategoryMultipleAsync: mutateAsync,
    isPending,
    error,
  };
}

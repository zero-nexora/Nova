"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteSubcategoryMultiple() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, error, isPending } = useMutation(
    trpc.admin.subcategoriesRouter.deleteMultiple.mutationOptions({
      onSuccess: (data) => {
        const { deleted, notFound } = data;
        if (data.success) {
          if (deleted) {
            toast.success(`${deleted} subcategory(s) deleted.`);
          }
          if (notFound) {
            toast.warning(`${notFound} subcategory(s) not found.`);
          }
        }

        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useCreateSubcategory ", error.message);
      },
    })
  );

  return {
    deleteSubcategoryMultiple: mutate,
    deleteSubcategoryMultipleAsync: mutateAsync,
    isPending,
    error,
  };
}

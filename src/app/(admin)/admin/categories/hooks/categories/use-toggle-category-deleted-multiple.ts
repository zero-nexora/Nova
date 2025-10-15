"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useToggleCategoryDeletedMultiple() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.categoriesRouter.toggleDeletedMultiple.mutationOptions({
      onSuccess: (data) => {
        const { notFound, updated } = data;

        if (updated) {
          toast.success(`${updated} category(s) status changed successfully`);
        }

        if (notFound) {
          toast.error(`${notFound} category(s) not found`);
        }

        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log(
          "Failed to useToggleCategoryDeletedMultiple ",
          error.message
        );
      },
    })
  );

  return {
    toggleCategoryMultiple: mutate,
    toggleCategoryMultipleAsync: mutateAsync,
    isPending,
    error,
  };
}

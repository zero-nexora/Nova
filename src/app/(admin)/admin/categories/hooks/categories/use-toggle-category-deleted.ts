"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleCategoryDeleted() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.categoriesRouter.toggleDeleted.mutationOptions({
      onSuccess: (data) => {
        const message =
          data.action === "deleted"
            ? `Category moved to trash successfully`
            : `Category restored successfully`;
        toast.success(message);

        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useToggleCategoryDeleted ", error.message);
      },
    })
  );

  return {
    toggleCategory: mutate,
    toggleCategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleSubcategoryDeleted() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.subcategoriesRouter.toggleDeleted.mutationOptions({
      onSuccess: (data) => {
        const message =
          data.action === "deleted"
            ? `Subcategory moved to trash successfully`
            : `Subcategory restored successfully`;
        toast.success(message);

        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useToggleSubcategoryDeleted ", error.message);
      },
    })
  );

  return {
    toggleSubcategory: mutate,
    toggleSubcategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

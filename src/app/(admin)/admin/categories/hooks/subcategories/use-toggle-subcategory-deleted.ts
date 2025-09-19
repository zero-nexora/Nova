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
        if (data.success) {
          toast.success(
            `Subcategory "${data.data.name}" has been ${data.action} successfully`
          );
        }

        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to toggle subcategory");
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
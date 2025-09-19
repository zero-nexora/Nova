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
        if (data.success) {
          const action =
            data.action === "deleted" ? "moved to trash" : "restored";
          toast.success(`Category "${data.data.name}" ${action} successfully`);
        }

        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to toggle category");
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

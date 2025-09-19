"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.categoriesRouter.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Category "${data.name}" created successfully`);
        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create category");
      },
    })
  );

  return {
    createCategory: mutate,
    createCategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

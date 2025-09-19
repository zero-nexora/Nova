"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateSubcategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.subcategoriesRouter.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Subcategory "${data.name}" created successfully`);
        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create subcategory");
      },
    })
  );

  return {
    createSubcategory: mutate,
    createSubcategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateSubcategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.subcategoriesRouter.create.mutationOptions({
      onSuccess: () => {
        toast.success(`Subcategory created successfully`);
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
    createSubcategory: mutate,
    createSubcategoryAsync: mutateAsync,
    isPending,
    error,
  };
}

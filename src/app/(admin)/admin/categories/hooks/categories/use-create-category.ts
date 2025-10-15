"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.categoriesRouter.create.mutationOptions({
      onSuccess: () => {
        toast.success(`Category created successfully`);
        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error("Something went wrong.");
        console.log("Failed to useCreateCategory ", error.message);
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

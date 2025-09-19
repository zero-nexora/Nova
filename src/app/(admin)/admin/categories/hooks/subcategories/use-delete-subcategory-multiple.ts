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
        if (data.success) {
          const messages = [];

          if (data.count > 0) {
            messages.push(
              `${data.count} subcategory(ies) deleted successfully`
            );
          }

          if (data.notFoundIds.length > 0) {
            messages.push(
              `${data.notFoundIds.length} subcategory(ies) not found`
            );
          }

          if (data.subcategoriesWithProducts.length > 0) {
            messages.push(
              `${data.subcategoriesWithProducts.length} subcategory(ies) cannot be deleted (has products)`
            );
          }

          if (messages.length > 0) {
            toast.success(messages.join(", "));
          } else {
            toast.info("No subcategories were processed");
          }
        }

        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete subcategory multiple");
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

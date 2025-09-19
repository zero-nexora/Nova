"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useToggleSubcategoryDeletedMultiple() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.subcategoriesRouter.toggleDeletedMultiple.mutationOptions({
      onSuccess: (data) => {
        if (data.success) {
          const messages = [];

          if (data.count > 0) {
            const deletedCount = data.data.filter(
              (item) => item.action === "deleted"
            ).length;
            const restoredCount = data.data.filter(
              (item) => item.action === "restored"
            ).length;

            if (deletedCount > 0) {
              messages.push(`${deletedCount} subcategory(ies) deleted`);
            }
            if (restoredCount > 0) {
              messages.push(`${restoredCount} subcategory(ies) restored`);
            }
          }

          if (data.notFoundIds.length > 0) {
            messages.push(
              `${data.notFoundIds.length} subcategory(ies) not found`
            );
          }

          if (data.violatingSubcategories.length > 0) {
            messages.push(
              `${data.violatingSubcategories.length} subcategory(ies) cannot be restored (parent category deleted)`
            );
          }

          if (messages.length > 0) {
            toast.success(messages.join(", "));
          }
        }

        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to toggle subcategory multiple");
      },
    })
  );

  return {
    toggleSubcategoryMultiple: mutate,
    toggleSubcategoryMultipleAsync: mutateAsync,
    isPending,
    error,
  };
}

"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useToggleCategoryDeletedMultiple() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.categoriesRouter.toggleDeletedMultiple.mutationOptions({
      onSuccess: (data) => {
        if (!data.success) return;

        const messages = [];

        if (data.count > 0) {
          const deletedCount = data.data.filter(
            (cat) => cat.action === "deleted"
          ).length;
          const restoredCount = data.data.filter(
            (cat) => cat.action === "restored"
          ).length;

          if (deletedCount > 0) {
            messages.push(`${deletedCount} category(ies) moved to trash`);
          }
          if (restoredCount > 0) {
            messages.push(`${restoredCount} category(ies) restored`);
          }
        }

        if (data.notFoundIds.length > 0) {
          messages.push(`${data.notFoundIds.length} category(ies) not found`);
        }

        if (data.affectedSubcategories > 0) {
          messages.push(
            `${data.affectedSubcategories} subcategory(ies) affected`
          );
        }

        if (data.affectedProducts > 0) {
          messages.push(`${data.affectedProducts} product(s) affected`);
        }

        if (messages.length > 0) {
          if (data.count > 0) {
            toast.success(messages.join(", "));
          } else {
            toast.info(messages.join(", "));
          }
        } else {
          toast.info("No categories were processed");
        }

        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to toggle categories");
      },
    })
  );

  return {
    toggleCategoryMultiple: mutate,
    toggleCategoryMultipleAsync: mutateAsync,
    isPending,
    error,
  };
}

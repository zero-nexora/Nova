"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteCategoryMultiple() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isPending, error } = useMutation(
    trpc.admin.categoriesRouter.deleteMultiple.mutationOptions({
      onSuccess: (data) => {
        const messages = [];

        if (data.count > 0) {
          messages.push(`${data.count} category(ies) deleted successfully`);
        }

        if (data.notFoundIds.length > 0) {
          messages.push(`${data.notFoundIds.length} category(ies) not found`);
        }

        if (data.categoriesWithSubcategories.length > 0) {
          const subcategoryDetails = data.categoriesWithSubcategories
            .map(
              (cat) => `"${cat.name}" (${cat.subcategoriesCount} subcategories)`
            )
            .join(", ");
          messages.push(
            `${data.categoriesWithSubcategories.length} category(ies) cannot be deleted (has subcategories): ${subcategoryDetails}`
          );
        }

        if (data.categoriesWithProducts.length > 0) {
          const productDetails = data.categoriesWithProducts
            .map((cat) => `"${cat.name}" (${cat.productsCount} products)`)
            .join(", ");
          messages.push(
            `${data.categoriesWithProducts.length} category(ies) cannot be deleted (has products): ${productDetails}`
          );
        }

        if (messages.length > 0) {
          if (data.count > 0) {
            toast.success(messages.join("; "));
          } else {
            toast.info(messages.join("; "));
          }
        } else {
          toast.info("No categories were processed");
        }

        queryClient.invalidateQueries(
          trpc.admin.categoriesRouter.getAll.queryOptions()
        );
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete categories");
      },
    })
  );

  return {
    deleteCategoryMultiple: mutate,
    deleteCategoryMultipleAsync: mutateAsync,
    isPending,
    error,
  };
}
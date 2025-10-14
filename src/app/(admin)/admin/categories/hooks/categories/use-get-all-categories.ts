"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useGetAllCategories() {
  const trpc = useTRPC();

  const { data, error } = useSuspenseQuery(
    trpc.admin.categoriesRouter.getAll.queryOptions()
  );

  return {
    error,
    categories: data,
  };
}

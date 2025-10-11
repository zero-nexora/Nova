"use client";

import { useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCategoriesStore } from "@/stores/admin/categories-store";

export function useGetAllCategories() {
  const trpc = useTRPC();
  const setCategories = useCategoriesStore((state) => state.setCategories);

  const { data, error } = useSuspenseQuery(
    trpc.admin.categoriesRouter.getAll.queryOptions()
  );

  useEffect(() => {
    if (data) {
      setCategories(data);
    }
  }, [data]);

  return {
    error,
    categories: data,
  };
}

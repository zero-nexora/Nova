"use client";

import { useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useCategoriesStore } from "@/stores/admin/categories-store";

export function useGetAllCategories() {
  const trpc = useTRPC();
  const setCategories = useCategoriesStore((state) => state.setCategories);
  const setLoading = useCategoriesStore((state) => state.setLoading);
  const setError = useCategoriesStore((state) => state.setError);

  const { data, error, isPending } = useQuery(
    trpc.admin.categoriesRouter.getAll.queryOptions()
  );

  useEffect(() => {
    if (data) {
      setCategories(data);
    }
  }, [data]);

  useEffect(() => {
    setLoading(isPending);
  }, [isPending]);

  useEffect(() => {
    if (error) setError(error.message);
  }, [error]);

  return {
    error,
    categories: data,
    isPending: isPending,
  };
}

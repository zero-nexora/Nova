"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useGetAllCategories() {
  const trpc = useTRPC();

  const { data, error } = useSuspenseQuery(
    trpc.client.categoriesRouterClient.getAll.queryOptions()
  );

  return {
    categories: data,
    error,
  };
}

"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useGetSuggest({ search }: { search: string }) {
  const trpc = useTRPC();

  const { data, isPending, error } = useQuery(
    trpc.client.productsRouterClient.getSuggest.queryOptions({ search })
  );

  return {
    suggest: data || [],
    error,
    isPending,
  };
}

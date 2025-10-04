"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useGetProductBySlug(slug: string) {
  const trpc = useTRPC();

  const { data, error, isPending, refetch } = useQuery(
    trpc.client.productsRouterClient.getBySlug.queryOptions({ slug })
  );

  return {
    product: data,
    error,
    isPending,
    refetch,
  };
}

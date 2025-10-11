"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useGetProductBySlug(slug: string) {
  const trpc = useTRPC();

  const { data, error } = useSuspenseQuery(
    trpc.client.productsRouterClient.getBySlug.queryOptions({ slug })
  );

  return {
    product: data,
    error,
  };
}

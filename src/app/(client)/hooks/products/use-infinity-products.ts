"use client";

import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ProductFilters } from "./use-product-fillter";
import { normalizeFilters } from "@/lib/utils";

export function useInfiniteProducts(params: ProductFilters) {
  const trpc = useTRPC();

  const normalizedParams = useMemo(() => normalizeFilters(params), [params]);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteQuery(
    trpc.client.productsRouterClient.getAll.infiniteQueryOptions(
      normalizedParams,
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    )
  );

  const products = useMemo(
    () => data?.pages.flatMap((p) => p.products) ?? [],
    [data?.pages]
  );

  return {
    products,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    error,
  };
}

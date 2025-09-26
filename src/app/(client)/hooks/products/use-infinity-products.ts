"use client";

import { DEFAULT_LIMIT } from "@/lib/constants";
import { GetInfiniteProductsSchema } from "@/queries/client/products/types";
import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import z from "zod";
import { ProductFilters } from "./use-product-fillter";

export function useInfiniteProducts(params: ProductFilters) {
  const trpc = useTRPC();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteQuery(
    trpc.client.productsRouterClient.getAll.infiniteQueryOptions(
      { ...params },
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

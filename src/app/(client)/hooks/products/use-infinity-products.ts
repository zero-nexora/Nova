"use client";

import { DEFAULT_LIMIT } from "@/lib/constants";
import { GetInfiniteProductsSchema } from "@/queries/client/products/types";
import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import z from "zod";

export function useInfiniteProducts(
  params: Omit<z.infer<typeof GetInfiniteProductsSchema>, "cursor"> = {
    limit: DEFAULT_LIMIT,
    sortBy: "created_at",
    sortOrder: "desc",
  }
) {
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
      { ...params, cursor: undefined },
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

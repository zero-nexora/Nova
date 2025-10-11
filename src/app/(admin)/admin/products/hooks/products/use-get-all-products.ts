"use client";

import { useTRPC } from "@/trpc/client";
import { keepPreviousData, useSuspenseQuery } from "@tanstack/react-query";
import { ProductFilters } from "./use-product-fillters";
import { cleanProductFilters } from "@/lib/utils";
import { useMemo } from "react";
import { DEFAULT_LIMIT } from "@/lib/constants";

export function useGetAllProducts(params: ProductFilters) {
  const trpc = useTRPC();

  const normalizedParams = useMemo(() => cleanProductFilters(params), [params]);

  const { data, error } = useSuspenseQuery(
    trpc.admin.productsRouter.getAll.queryOptions(
      {
        ...normalizedParams,
        limit: DEFAULT_LIMIT,
      },
      {
        placeholderData: keepPreviousData,
      }
    )
  );

  return {
    products: data?.products ?? [],
    pagination: data?.pagination ?? null,
    error,
  };
}

"use client";

import { useMemo } from "react";
import { useTRPC } from "@/trpc/client";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";
import { cleanProductFilters } from "@/lib/utils";
import { ProductFilters } from "./use-product-fillters";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useGetAllProducts(params: ProductFilters) {
  const trpc = useTRPC();

  const normalizedParams = useMemo(() => cleanProductFilters(params), [params]);

  const { data, error, isPending, isRefetching } = useQuery(
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

  if (!data) {
    return {
      products: [],
      totalProducts: 0,
      page: DEFAULT_PAGE,
      limit: DEFAULT_LIMIT,
      isPending,
      error,
    };
  }

  const { items, limit, page, totalItems } = data;

  return {
    products: items,
    totalProducts: totalItems,
    page,
    limit,
    isPending,
    isRefetching,
    error,
  };
}

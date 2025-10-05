"use client";

import { useTRPC } from "@/trpc/client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ProductFilters } from "./use-product-fillters";
import { cleanProductFilters } from "@/lib/utils";
import { useMemo } from "react";

export function useGetAllProducts(params: ProductFilters) {
  const trpc = useTRPC();

  const normalizedParams = useMemo(() => cleanProductFilters(params), [params]);

  const { data, error, isPending, isFetching } = useQuery(
    trpc.admin.productsRouter.getAll.queryOptions(normalizedParams, {
      placeholderData: keepPreviousData,
    })
  );

  return {
    products: data?.products ?? [],
    pagination: data?.pagination ?? null,
    isPending,
    isFetching,
    error,
  };
}

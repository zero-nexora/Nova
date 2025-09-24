"use client";

import z from "zod";
import { useTRPC } from "@/trpc/client";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GetAllProductsSchema } from "@/queries/admin/products/types";

export function useGetAllProducts(
  params: z.infer<typeof GetAllProductsSchema> = {
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    sortBy: "created_at",
    sortOrder: "asc",
  }
) {
  const trpc = useTRPC();

  const { data, error, isPending, isFetching } = useQuery(
    trpc.client.productsRouterClient.getAll.queryOptions(params, {
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

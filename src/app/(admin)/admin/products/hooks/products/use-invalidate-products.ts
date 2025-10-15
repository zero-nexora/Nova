"use client";

import { useMemo } from "react";
import { useTRPC } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { cleanProductFilters } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useProductFilters } from "./use-product-fillters";

export function useInvalidateProducts() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { filters } = useProductFilters();

  const normalizedParams = useMemo(
    () => cleanProductFilters(filters),
    [filters]
  );

  const invalidate = async () => {
    return await queryClient.invalidateQueries(
      trpc.admin.productsRouter.getAll.queryOptions({
        ...normalizedParams,
        limit: DEFAULT_LIMIT,
      })
    );
  };

  return { invalidate };
}

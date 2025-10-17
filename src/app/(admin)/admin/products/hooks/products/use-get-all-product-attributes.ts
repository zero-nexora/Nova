"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useGetAllProductAttributes() {
  const trpc = useTRPC();
  
  const { data, error } = useSuspenseQuery(
    trpc.admin.productAttributesRouter.getAllProductAttributes.queryOptions()
  );

  return {
    productAttributes: data,
    error,
  };
}

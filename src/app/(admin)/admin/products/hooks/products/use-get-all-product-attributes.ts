"use client";

import { useProductAttributesStore } from "@/stores/admin/product-attribute-store";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useGetAllProductAttributes() {
  const setProductAttributes = useProductAttributesStore(
    (state) => state.setProductAttributes
  );
  const trpc = useTRPC();
  const { data, error } = useSuspenseQuery(
    trpc.admin.productsRouter.getAllProductAttributes.queryOptions()
  );

  useEffect(() => {
    if (data) setProductAttributes(data);
  }, [data]);

  return {
    productAttributes: data,
    error,
  };
}

"use client";

import { useProductAttributesStore } from "@/stores/admin/product-attribute-store";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useGetAllProductAttributes() {
  const setProductAttributes = useProductAttributesStore(
    (state) => state.setProductAttributes
  );
  const setLoading = useProductAttributesStore((state) => state.setLoading);
  const setError = useProductAttributesStore((state) => state.setError);
  const trpc = useTRPC();
  const { data, isPending, error } = useQuery(
    trpc.admin.productsRouter.getAllProductAttributes.queryOptions()
  );

  useEffect(() => {
    if (data) setProductAttributes(data);
  }, [data]);

  useEffect(() => {
    setLoading(isPending);
  }, [isPending]);

  useEffect(() => {
    if (error) setError(error);
  }, [error]);

  return {
    productAttributes: data,
    isPending,
    error,
  };
}

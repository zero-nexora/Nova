"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useGetCart() {
  const trpc = useTRPC();

  const { data, isPending, error } = useQuery(
    trpc.client.cartsRouter.getCart.queryOptions()
  );

  return {
    cart: data,
    isPending,
    error,
  };
}

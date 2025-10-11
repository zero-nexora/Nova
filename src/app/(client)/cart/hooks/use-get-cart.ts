"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useGetCart() {
  const trpc = useTRPC();

  const { data, error } = useSuspenseQuery(
    trpc.client.cartsRouter.getCart.queryOptions()
  );

  return {
    cart: data,
    error,
  };
}

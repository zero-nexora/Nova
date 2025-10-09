"use client";

import { useCartStore } from "@/stores/client/carts-store";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useGetCart() {
  const trpc = useTRPC();
  const { setCart, setError, setLoading, clearCart } = useCartStore();

  const { data, isPending, error } = useQuery(
    trpc.client.cartsRouter.getCart.queryOptions()
  );

  useEffect(() => {
    if (data) setCart(data);
    else clearCart();
  }, [data]);

  useEffect(() => {
    if (error) setError(error.message);
  }, [error]);

  useEffect(() => {
    setLoading(isPending);
  }, [isPending]);

  return {
    cart: data,
    isPending,
    error,
  };
}

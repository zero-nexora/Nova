"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useGetCurrentUser() {
  const trpc = useTRPC();

  const { data, isPending, error } = useQuery(
    trpc.client.usersRouter.getCurrentUser.queryOptions()
  );

  return {
    user: data,
    isPending,
    error,
  };
}

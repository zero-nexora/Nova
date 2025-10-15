"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useGetCurrentUser() {
  const trpc = useTRPC();

  const { data, error, refetch } = useSuspenseQuery(
    trpc.client.usersRouter.getCurrentUser.queryOptions()
  );

  return {
    user: data,
    error,
    refetch
  };
}

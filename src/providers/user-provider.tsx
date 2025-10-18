"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";

export const UserProvider = () => {
  const { userId, isSignedIn } = useAuth();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const queryKey = trpc.client.usersRouter.getCurrentUser.queryKey();
  const queryOptions = trpc.client.usersRouter.getCurrentUser.queryOptions();

  useEffect(() => {
    if (!isSignedIn || !userId) {
      queryClient.setQueryData(queryKey, null);
      return;
    }

    queryClient.invalidateQueries(queryOptions);
  }, [isSignedIn, userId, queryClient]);

  return null;
};

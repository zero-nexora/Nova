"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";

export const UserProvider = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const trpc = useTRPC();

  useEffect(() => {
    if (userId) {
      queryClient.invalidateQueries(
        trpc.client.usersRouter.getCurrentUser.queryOptions()
      );
    } else {
      queryClient.setQueryData(
        trpc.client.usersRouter.getCurrentUser.queryKey(),
        null
      );
    }
  }, [userId, queryClient]);

  return null;
};

"use client";

import { cleanUserRoleFilters } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { keepPreviousData, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { UserRoleFilters } from "./use-user-filters";
import { DEFAULT_LIMIT } from "@/lib/constants";

export function useGetUsers(params: UserRoleFilters) {
  const trpc = useTRPC();

  const normalizedParams = useMemo(
    () => cleanUserRoleFilters(params),
    [params]
  );

  const { data, error } = useSuspenseQuery(
    trpc.admin.rolesRouter.getUserByRole.queryOptions(
      {
        ...normalizedParams,
        limit: DEFAULT_LIMIT,
      },
      {
        placeholderData: keepPreviousData,
      }
    )
  );

  return {
    users: data?.users,
    totalItem: data?.total,
    error,
  };
}

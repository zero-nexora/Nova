"use client";

import { cleanUserRoleFilters } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { UserRoleFilters } from "./use-user-filters";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";

export function useGetUsers(params: UserRoleFilters) {
  const trpc = useTRPC();

  const normalizedParams = useMemo(
    () => cleanUserRoleFilters(params),
    [params]
  );

  const { data, error, isPending, isRefetching } = useQuery(
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

  if (!data) {
    return {
      users: [],
      totalUsers: 0,
      page: DEFAULT_PAGE,
      limit: DEFAULT_LIMIT,
      isPending,
      error,
    };
  }

  const { items, limit, page, totalItems } = data;

  return {
    page,
    error,
    limit,
    isPending,
    isRefetching,
    users: items,
    totalUsers: totalItems,
  };
}

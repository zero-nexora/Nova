"use client";

import { useMemo } from "react";
import { useTRPC } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { cleanUserRoleFilters } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useUserRoleFilters } from "./use-user-filters";

export function useInvalidateUserRoles() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { filters } = useUserRoleFilters();

  const normalizedParams = useMemo(
    () => cleanUserRoleFilters(filters),
    [filters]
  );

  const invalidate = () => {
    return queryClient.invalidateQueries(
      trpc.admin.rolesRouter.getUserByRole.queryOptions({
        ...normalizedParams,
        limit: DEFAULT_LIMIT,
      })
    );
  };

  return { invalidate };
}

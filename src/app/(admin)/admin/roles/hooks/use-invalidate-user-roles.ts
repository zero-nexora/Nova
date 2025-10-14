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

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: trpc.admin.rolesRouter.getUserByRole.queryKey({
          ...normalizedParams,
          limit: DEFAULT_LIMIT,
        }),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.admin.permissionsRouter.getAllPermissions.queryKey(),
      }),
    ]);
  };

  return { invalidate };
}

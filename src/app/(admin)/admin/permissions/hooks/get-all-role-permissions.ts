"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useGetAllRolePermissions() {
  const trpc = useTRPC();

  const { data, error } = useSuspenseQuery(
    trpc.admin.permissionsRouter.getAllRolePermissions.queryOptions()
  );

  return {
    roleAndPermissions: data,
    error,
  };
}

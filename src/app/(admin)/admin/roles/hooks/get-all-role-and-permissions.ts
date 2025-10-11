"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useGetAllRolesAndPerrmissions() {
  const trpc = useTRPC();

  const { data, error } = useSuspenseQuery(
    trpc.admin.rolesAndPermissionsRouter.getAllRoleAndPermissions.queryOptions()
  );

  return {
    rolesAndPermissions: data,
    error,
  };
}

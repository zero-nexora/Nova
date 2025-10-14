"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useGetAllPerrmissions() {
  const trpc = useTRPC();

  const { data, error } = useSuspenseQuery(
    trpc.admin.permissionsRouter.getAllPermissions.queryOptions()
  );

  return {
    rolesAndPermissions: data,
    error,
  };
}

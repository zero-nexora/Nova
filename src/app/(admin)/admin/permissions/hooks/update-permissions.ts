"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PermissionUpdate,
  RolePermissionData,
} from "@/queries/admin/permissions/types";

export function useUpdatePermissions() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation(
    trpc.admin.permissionsRouter.updatePermissions.mutationOptions({
      onMutate: async (variables: PermissionUpdate[]) => {
        await queryClient.cancelQueries(
          trpc.admin.permissionsRouter.getAllRolePermissions.queryOptions()
        );

        const previousPermissions = queryClient.getQueryData(
          trpc.admin.permissionsRouter.getAllRolePermissions.queryKey()
        );

        queryClient.setQueryData<RolePermissionData>(
          trpc.admin.permissionsRouter.getAllRolePermissions.queryKey(),
          (oldData) =>
            oldData
              ? {
                  ...oldData,
                  roles: oldData.roles.map((role) => {
                    const updatesForRole = variables.filter(
                      (v) => v.roleId === role.id
                    );
                    if (updatesForRole.length === 0) return role;

                    return {
                      ...role,
                      permissions: role.permissions.map((perm) => {
                        const update = updatesForRole.find(
                          (v) => v.permissionId === perm.id
                        );
                        return update
                          ? { ...perm, isAssigned: update.assign }
                          : perm;
                      }),
                    };
                  }),
                }
              : oldData
        );

        return { previousPermissions };
      },
      onError: (error, __, context) => {
        queryClient.setQueryData(
          trpc.admin.permissionsRouter.getAllRolePermissions.queryKey(),
          context?.previousPermissions
        );

        toast.error("Something went wrong.");
        console.log("Failed to useDeleteProduct ", error.message);
      },
      onSuccess: () => {
        toast.success("Permissions updated successfully");
      },
      onSettled: () => {
        queryClient.invalidateQueries(
          trpc.admin.permissionsRouter.getAllRolePermissions.queryOptions()
        );
      },
    })
  );

  return {
    updateRoleAndPermissions: mutation.mutate,
    updateRoleAndPermissionsAsync: mutation.mutateAsync,
    error: mutation.error,
    isPending: mutation.isPending,
  };
}

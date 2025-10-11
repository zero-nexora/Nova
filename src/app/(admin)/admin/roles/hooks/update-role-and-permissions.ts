"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateRoleAndPermissions() {
  const trpc = useTRPC();

  const { mutateAsync, mutate, error, isPending } = useMutation(
    trpc.admin.rolesAndPermissionsRouter.updateRoleAndPermissions.mutationOptions(
      {
        onSuccess: () => {
          toast.success("Save successfully");
        },
        onError: (error) => {
          console.log(error);
        },
      }
    )
  );

  return {
    updateRoleAndPermissions: mutate,
    updateRoleAndPermissionsAsync: mutateAsync,
    error,
    isPending,
  };
}

"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useInvalidateUserRoles } from "./use-invalidate-user-roles";

export function useUpdateUserRoles() {
  const trpc = useTRPC();
  const { invalidate } = useInvalidateUserRoles();

  const { mutate, mutateAsync, error, isPending } = useMutation(
    trpc.admin.rolesRouter.updateUserRole.mutationOptions({
      onSuccess: () => {
        toast.success("User role updated successfully!");
      },
      onError: (error) => {
        console.error("Failed to update user role:", error);
      },
      onSettled: () => {
        invalidate();
      },
    })
  );

  return {
    updateUserRole: mutate,
    updateUserRoleAsync: mutateAsync,
    error,
    isPending,
  };
}

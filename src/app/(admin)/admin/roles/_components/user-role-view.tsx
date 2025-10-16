"use client";

import { useCallback } from "react";
import { Error } from "@/components/global/error";
import { Skeleton } from "@/components/ui/skeleton";
import { useModal } from "@/stores/modal-store";
import { UpdateUserRoleForm } from "@/components/forms/role/update-user-role-form";
import { useGetUsers } from "../hooks/use-get-users";
import { useUserRoleFilters } from "../hooks/use-user-filters";
import { UserFilter } from "./user-filter";
import { UserRolesTable } from "./user-roles-table";
import { User } from "@/queries/admin/roles/types";

export const UserRoleView = () => {
  const { filters } = useUserRoleFilters();
  const { open } = useModal();

  const { users, totalUsers, error, isPending, isRefetching } =
    useGetUsers(filters);

  const handleUpdateRoles = useCallback(
    (user: User) => {
      open({
        title: "Update User Roles",
        description: `Modify the roles for ${user.email}`,
        children: <UpdateUserRoleForm user={user} />,
      });
    },
    [open]
  );

  if (error) return <Error />;

  if (isPending) return <UserRoleViewSkeleton />;

  return (
    <div className="space-y-6">
      <UserFilter />

      <UserRolesTable
        users={users}
        totalUsers={totalUsers}
        currentPage={filters.page}
        pageSize={filters.limit}
        onUpdateRoles={handleUpdateRoles}
        isRefetching={isRefetching}
      />
    </div>
  );
};

export const UserRoleViewSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <Skeleton className="h-10 w-96" />
      </div>

      <div>
        <Skeleton className="h-96 w-full" />
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-56" />
        </div>
      </div>
    </div>
  );
};

"use client";

import { useCallback } from "react";
import { Empty } from "@/components/global/empty";
import { Error } from "@/components/global/error";
import { Skeleton } from "@/components/ui/skeleton";
import { useModal } from "@/stores/modal-store";
import { UpdateUserRoleForm } from "@/components/forms/role/update-user-role-form";
import { useGetUsers } from "../hooks/use-get-users";
import { useUserRoleFilters } from "../hooks/use-user-filters";
import { UserFilter } from "./user-filter";
import { UserRolesTable } from "./user-roles-table";
import { User } from "@/queries/admin/roles/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

  if (users.length === 0) return <Empty />;

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

      <Card className="bg-muted/10 border">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
          <div className="mt-4 flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-20" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

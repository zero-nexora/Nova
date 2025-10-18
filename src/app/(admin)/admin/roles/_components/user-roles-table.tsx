"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { User } from "@/queries/admin/roles/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserRoleFilters } from "../hooks/use-user-filters";
import { useUpdateUserRoles } from "../hooks/use-update-user-roles";
import { useGetAllRolePermissions } from "../../permissions/hooks/get-all-role-permissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserRolesTableProps {
  users: User[];
  totalUsers: number;
  currentPage: number;
  pageSize: number;
  isRefetching?: boolean;
}

interface RoleUpdate {
  userId: string;
  roleId: string;
  assign: boolean;
}

// ... (other imports and code remain unchanged)

export const UserRolesTable = ({
  users,
  totalUsers,
  currentPage,
  pageSize,
  isRefetching = false,
}: UserRolesTableProps) => {
  const { updateFilter } = useUserRoleFilters();
  const { roleAndPermissions } = useGetAllRolePermissions();
  const { updateUserRole, isPending } = useUpdateUserRoles();
  const [pendingChanges, setPendingChanges] = useState<RoleUpdate[]>([]);

  const roles = useMemo(
    () => roleAndPermissions?.roles ?? [],
    [roleAndPermissions?.roles]
  );

  const totalPages = useMemo(
    () => Math.ceil(totalUsers / pageSize),
    [totalUsers, pageSize]
  );

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateFilter("page", newPage);
  };

  const getUserName = (user: User) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
    }
    return "N/A";
  };

  const getCheckboxState = (userId: string, roleId: string): boolean => {
    const pendingChange = pendingChanges.find(
      (change) => change.userId === userId && change.roleId === roleId
    );
    if (pendingChange) {
      return pendingChange.assign;
    }
    const user = users.find((u) => u.id === userId);
    return user?.roles?.some((r) => r.role.id === roleId) ?? false;
  };

  const getOriginalState = (userId: string, roleId: string): boolean => {
    const user = users.find((u) => u.id === userId);
    return user?.roles?.some((r) => r.role.id === roleId) ?? false;
  };

  const handleToggleRole = (
    userId: string,
    roleId: string,
    currentState: boolean
  ) => {
    const originalState = getOriginalState(userId, roleId);
    const newState = !currentState;

    setPendingChanges((prev) => {
      // Find the Admin role
      const adminRole = roles.find(
        (role) => role.name.toLowerCase() === "admin"
      );
      const isAdminRole = adminRole && roleId === adminRole.id;

      let filteredChanges = prev.filter(
        (change) => !(change.userId === userId && change.roleId === roleId)
      );

      // If the Admin role is being checked
      if (isAdminRole && newState) {
        // Remove all other role changes for this user
        filteredChanges = filteredChanges.filter(
          (change) => change.userId !== userId
        );
        // Add only the Admin role assignment
        return [...filteredChanges, { userId, roleId, assign: true }];
      }

      // If toggling off Admin or toggling any other role
      if (newState !== originalState) {
        filteredChanges = [
          ...filteredChanges,
          { userId, roleId, assign: newState },
        ];
      }

      return filteredChanges;
    });
  };

  const handleSaveChanges = async () => {
    if (pendingChanges.length === 0) {
      toast.info("No changes to save");
      return;
    }

    const changesByUser = pendingChanges.reduce((acc, change) => {
      if (!acc[change.userId]) {
        acc[change.userId] = [];
      }
      acc[change.userId].push(change);
      return acc;
    }, {} as Record<string, RoleUpdate[]>);

    await Promise.all(
      Object.entries(changesByUser).map(([userId, changes]) => {
        const user = users.find((u) => u.id === userId);
        if (!user) return Promise.resolve();

        const currentRoleIds = user.roles?.map((r) => r.role.id) ?? [];
        const updatedRoleIds = currentRoleIds.filter(
          (roleId) => !changes.some((c) => c.roleId === roleId && !c.assign)
        );

        changes.forEach((change) => {
          if (change.assign && !updatedRoleIds.includes(change.roleId)) {
            updatedRoleIds.push(change.roleId);
          }
        });

        return updateUserRole({ userId, roleIds: updatedRoleIds });
      })
    );

    setPendingChanges([]);
  };

  // Determine if a checkbox should be disabled
  const isCheckboxDisabled = (userId: string, roleId: string): boolean => {
    const adminRole = roles.find((role) => role.name.toLowerCase() === "admin");
    if (!adminRole) return isPending;

    const isAdminChecked = getCheckboxState(userId, adminRole.id);
    const isCurrentRoleAdmin = roleId === adminRole.id;

    // Disable non-Admin roles if Admin is checked
    return isPending || (isAdminChecked && !isCurrentRoleAdmin);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="font-bold">Users ({totalUsers})</div>
        <Button
          onClick={handleSaveChanges}
          disabled={isPending || pendingChanges.length === 0}
          className={cn(
            "flex items-center gap-2",
            (isPending || pendingChanges.length === 0) &&
              "opacity-75 cursor-not-allowed"
          )}
        >
          Save Changes
        </Button>
      </div>

      <div
        className={cn(
          "rounded-md border",
          isRefetching && "opacity-80 pointer-events-none"
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              {roles.map((r) => (
                <TableHead key={r.id} className="font-semibold text-center">
                  {r.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{getUserName(user)}</span>
                  </TableCell>
                  {roles.map((r) => {
                    const isChecked = getCheckboxState(user.id, r.id);
                    return (
                      <TableCell key={r.id} className="text-center">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() =>
                            handleToggleRole(user.id, r.id, isChecked)
                          }
                          disabled={isCheckboxDisabled(user.id, r.id)}
                          className={cn(
                            "h-5 w-5",
                            isCheckboxDisabled(user.id, r.id) &&
                              "opacity-50 cursor-not-allowed"
                          )}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={roles.length + 2} className="text-center">
                  <div className="py-8">No users found</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(1)}
                disabled={!hasPreviousPage}
              >
                <span className="sr-only">Go to first page</span>⟪
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPreviousPage}
              >
                <span className="sr-only">Go to previous page</span>⟨
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
              >
                <span className="sr-only">Go to next page</span>⟩
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(totalPages)}
                disabled={!hasNextPage}
              >
                <span className="sr-only">Go to last page</span>⟫
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

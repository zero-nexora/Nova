"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Error } from "@/components/global/error";
import { Loading } from "@/components/global/loading";
import { cn } from "@/lib/utils";
import { UserByRole } from "@/queries/admin/roles/types";
import { ActionMenu } from "@/components/global/action-menu";
import { useUserRoleFilters } from "../hooks/use-user-filters";
import { useGetUsers } from "../hooks/use-get-users";
import { Empty } from "@/components/global/empty";
import { useModal } from "@/stores/modal-store";
import { UpdateUserRoleForm } from "@/components/forms/role/update-user-role-form";

export const UserRolesTable = () => {
  const { filters, updateFilter } = useUserRoleFilters();

  const open = useModal((state) => state.open);

  const { users, totalItem, isPending, error } = useGetUsers(filters);

  const totalPages = Math.ceil(totalItem || 0 / filters.limit);

  const handleUpdateRoles = (user: UserByRole) => {
    open({
      title: "",
      description: "",
      children: <UpdateUserRoleForm user={user} />
    })
  };

  if (!users) return <Error />;
  if (users.length === 0) return <Empty />;
  if (error) return <Error />;
  if (isPending) return <Loading />;

  return (
    <div className="space-y-6 p-6 rounded-lg shadow">
      <div className="border rounded-lg overflow-x-auto shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold py-4">Email</TableHead>
              <TableHead className="font-semibold py-4">Name</TableHead>
              <TableHead className="font-semibold py-4">Roles</TableHead>
              <TableHead className="font-semibold py-4 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="py-3">{user.email}</TableCell>
                <TableCell className="py-3">
                  {user.first_name || user.last_name
                    ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
                    : "N/A"}
                </TableCell>
                <TableCell className="py-3">
                  {user.roles.length > 0 ? (
                    user.roles.map((r) => (
                      <Badge key={r.id} variant="secondary" className="mr-2">
                        {r.role.name}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">None</Badge>
                  )}
                </TableCell>
                <TableCell className="py-3 text-right">
                  <ActionMenu onUpdate={() => handleUpdateRoles(user)} />
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-4 text-center text-gray-500"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center">
        <div>
          Showing {users.length} of {totalItem} users
        </div>
        <div className="flex gap-2">
          <Button
            disabled={filters.page === 1}
            onClick={() => updateFilter("page", filters.page - 1)}
            className={cn(
              filters.page === 1 && "opacity-50 cursor-not-allowed"
            )}
          >
            Previous
          </Button>
          <Button
            disabled={filters.page === totalPages || totalItem === 0}
            onClick={() => updateFilter("page", filters.page + 1)}
            className={cn(
              (filters.page === totalPages || totalItem === 0) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

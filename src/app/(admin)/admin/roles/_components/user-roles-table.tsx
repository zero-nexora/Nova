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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Error } from "@/components/global/error";
import { Separator } from "@/components/ui/separator";
import { UserByRole } from "@/queries/admin/roles/types";
import { ActionMenu } from "@/components/global/action-menu";
import { useUserRoleFilters } from "../hooks/use-user-filters";
import { useGetUsers } from "../hooks/use-get-users";
import { Empty } from "@/components/global/empty";
import { useModal } from "@/stores/modal-store";
import { UpdateUserRoleForm } from "@/components/forms/role/update-user-role-form";

export const UserRolesTable = () => {
  const { filters, updateFilter } = useUserRoleFilters();
  const { open } = useModal();
  const { users, totalItem, error } = useGetUsers(filters);

  const totalPages = Math.ceil(totalItem / filters.limit);
  const hasPreviousPage = filters.page > 1;
  const hasNextPage = filters.page < totalPages;

  const handlePageChange = (page: number) => {
    updateFilter("page", page);
  };

  const handleUpdateRoles = (user: UserByRole) => {
    open({
      title: "Update User Roles",
      description: `Modify the roles for ${user.email}`,
      children: <UpdateUserRoleForm user={user} />,
    });
  };

  if (users.length === 0 && !error) return <Empty />;
  if (error) return <Error />;

  return (
    <div className="space-y-4 rounded-lg shadow">
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
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center">
        {totalPages > 1 && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {filters.page} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(1)}
                    disabled={!hasPreviousPage}
                  >
                    <span className="sr-only">Go to first page</span>
                    <span>⟪</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={!hasPreviousPage}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <span>⟨</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={!hasNextPage}
                  >
                    <span className="sr-only">Go to next page</span>
                    <span>⟩</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={!hasNextPage}
                  >
                    <span className="sr-only">Go to last page</span>
                    <span>⟫</span>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

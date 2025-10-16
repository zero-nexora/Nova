"use client";

import React, { useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ActionMenu } from "@/components/global/action-menu";
import { NotFound } from "@/components/global/not-found";
import { useUserRoleFilters } from "../hooks/use-user-filters";
import { User } from "@/queries/admin/roles/types";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserRolesTableProps {
  users: User[];
  totalUsers: number;
  currentPage: number;
  pageSize: number;
  onUpdateRoles?: (user: User) => void;
  isRefetching?: boolean;
}

export const UserRolesTable = ({
  users,
  totalUsers,
  currentPage,
  pageSize,
  onUpdateRoles,
  isRefetching = false,
}: UserRolesTableProps) => {
  const { updateFilter } = useUserRoleFilters();

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

  return (
    <Card className="bg-muted/10 border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Users ({totalUsers})</CardTitle>

          <div className="flex items-center gap-2">
            {/* Export Button */}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Table */}
        <div className={cn(isRefetching && "opacity-80 pointer-events-none")}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Roles</TableHead>
                <TableHead className="font-semibold text-right">
                  Actions
                </TableHead>
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

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((r) => (
                            <Badge
                              key={r.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {r.role.name}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            No roles
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <ActionMenu onUpdate={() => onUpdateRoles?.(user)} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <NotFound />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers}{" "}
                users
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

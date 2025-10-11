"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Error } from "@/components/global/error";
import { RolePermissionData } from "@/queries/admin/roles-permissions/types";
import { useGetAllRolesAndPerrmissions } from "../hooks/get-all-role-and-permissions";
import { useUpdateRoleAndPermissions } from "../hooks/update-role-and-permissions";
import { toast } from "sonner";
import { Loading } from "@/components/global/loading";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface PermissionChange {
  roleId: string;
  permissionId: string;
  assign: boolean;
}

export const TableSkeleton = () => {
  const groupCount = 4; 
  const permissionsPerGroup = 4;
  return (
    <div className="border rounded-lg overflow-x-auto shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-48 font-semibold py-4">
              <Skeleton className="h-4 w-32" />
            </TableHead>
            {[...Array(3)].map((_, index) => (
              <TableHead
                key={index}
                className="text-center font-semibold py-4"
              >
                <Skeleton className="h-4 w-24 mx-auto" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(groupCount)].map((_, groupIndex) => (
            <React.Fragment key={groupIndex}>
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center font-bold py-4"
                >
                  <Skeleton className="h-4 w-40 mx-auto" />
                </TableCell>
              </TableRow>
              {[...Array(permissionsPerGroup)].map((_, permIndex) => (
                <TableRow
                  key={`${groupIndex}-${permIndex}`}
                  className="transition-colors"
                >
                  <TableCell className="pl-6">
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  {[...Array(3)].map((_, roleIndex) => (
                    <TableCell key={roleIndex} className="text-center">
                      <Skeleton className="h-5 w-5 mx-auto rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const RolesAndPermissionsTable = () => {
  const { rolesAndPermissions, error } = useGetAllRolesAndPerrmissions();
  const { updateRoleAndPermissionsAsync, isPending } =
    useUpdateRoleAndPermissions();

  const [changes, setChanges] = useState<PermissionChange[]>([]);

  const handleTogglePermission = (
    roleId: string,
    permissionId: string,
    currentState: boolean
  ) => {
    setChanges((prev) => {
      const filtered = prev.filter(
        (change) =>
          !(change.roleId === roleId && change.permissionId === permissionId)
      );
      return [...filtered, { roleId, permissionId, assign: !currentState }];
    });
  };

  const handleSaveChanges = async () => {
    if (changes.length === 0) {
      toast.info("No permission changes to save");
      return;
    }
    await updateRoleAndPermissionsAsync(changes);
    setChanges([]);
    toast.success("Permissions updated successfully");
  };

  if (error) {
    return <Error />;
  }

  const { roles, permissions } = rolesAndPermissions as RolePermissionData;

  const getCheckboxState = (roleId: string, permissionId: string) => {
    const change = changes.find(
      (c) => c.roleId === roleId && c.permissionId === permissionId
    );
    if (change) {
      return change.assign;
    }
    const role = roles.find((r) => r.id === roleId);
    const rolePermission = role?.permissions.find((p) => p.id === permissionId);
    return rolePermission?.isAssigned || false;
  };

  return (
    <div className="space-y-6 p-6 rounded-lg shadow">
      <div className="flex justify-end items-center">
        <Button
          onClick={handleSaveChanges}
          disabled={isPending || changes.length === 0}
          className={cn(
            "flex items-center gap-2",
            isPending && "opacity-75 cursor-not-allowed"
          )}
        >
          {isPending ? (
            <Loading />
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
      <div className="border rounded-lg overflow-x-auto shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48 font-semibold py-4">
                Permission
              </TableHead>
              {roles.map((role) => (
                <TableHead
                  key={role.id}
                  className="text-center font-semibold py-4"
                >
                  {role.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((group) => (
              <React.Fragment key={group.group}>
                <TableRow>
                  <TableCell
                    colSpan={roles.length + 1}
                    className="text-center font-bold py-4"
                  >
                    {group.group}
                  </TableCell>
                </TableRow>
                {group.permissions.map((permission) => (
                  <TableRow
                    key={permission.id}
                    className="transition-colors"
                  >
                    <TableCell className="font-medium py-3 pl-6">
                      {permission.name}
                    </TableCell>
                    {roles.map((role) => {
                      const isChecked = getCheckboxState(role.id, permission.id);
                      return (
                        <TableCell key={role.id} className="text-center py-3">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() =>
                              handleTogglePermission(
                                role.id,
                                permission.id,
                                isChecked
                              )
                            }
                            disabled={isPending}
                            className={cn(
                              "h-5 w-5",
                              isPending && "opacity-50 cursor-not-allowed"
                            )}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { useUpdatePermissions } from "../hooks/update-permissions";
import { useGetAllRolePermissions } from "../hooks/get-all-role-permissions";

import { Button } from "@/components/ui/button";
import { Error } from "@/components/global/error";
import { Checkbox } from "@/components/ui/checkbox";
import { Loading } from "@/components/global/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PermissionUpdate } from "@/queries/admin/permissions/types";
import { Empty } from "@/components/global/empty";

export const PermissionsTable = () => {
  const { roleAndPermissions, error } = useGetAllRolePermissions();
  const { updateRoleAndPermissionsAsync, isPending } = useUpdatePermissions();

  const [pendingChanges, setPendingChanges] = useState<PermissionUpdate[]>([]);

  const roles = roleAndPermissions?.roles ?? [];
  const permissions = roleAndPermissions?.permissions ?? [];

  const getCheckboxState = (roleId: string, permissionId: string): boolean => {
    const pendingChange = pendingChanges.find(
      (change) =>
        change.roleId === roleId && change.permissionId === permissionId
    );
    if (pendingChange) {
      return pendingChange.assign;
    }

    const role = roles.find((r) => r.id === roleId);
    const permission = role?.permissions.find((p) => p.id === permissionId);
    return permission?.isAssigned ?? false;
  };

  const handleTogglePermission = (
    roleId: string,
    permissionId: string,
    currentState: boolean
  ) => {
    setPendingChanges((prev) => {
      const filteredChanges = prev.filter(
        (change) =>
          !(change.roleId === roleId && change.permissionId === permissionId)
      );
      return [
        ...filteredChanges,
        { roleId, permissionId, assign: !currentState },
      ];
    });
  };

  const handleSaveChanges = async () => {
    if (pendingChanges.length === 0) {
      toast.info("No changes to save");
      return;
    }

    try {
      await updateRoleAndPermissionsAsync(pendingChanges);
      setPendingChanges([]);
    } catch (error) {
      console.log(error);
    }
  };

  if (error) return <Error />;

  if (!roleAndPermissions) return <Empty />;

  return (
    <div className="space-y-6 rounded-lg shadow">
      <div className="flex justify-end items-center">
        <Button
          onClick={handleSaveChanges}
          disabled={isPending || pendingChanges.length === 0}
          className={cn(
            "flex items-center gap-2",
            (isPending || pendingChanges.length === 0) &&
              "opacity-75 cursor-not-allowed"
          )}
        >
          {isPending ? <Loading /> : "Save Changes"}
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
                  <TableRow key={permission.id} className="transition-colors">
                    <TableCell className="font-medium py-3 pl-6">
                      {permission.name}
                    </TableCell>
                    {roles.map((role) => {
                      const isChecked = getCheckboxState(
                        role.id,
                        permission.id
                      );
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

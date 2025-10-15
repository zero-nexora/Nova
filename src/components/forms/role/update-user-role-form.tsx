"use client";

import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import { Error } from "@/components/global/error";
import { Loading } from "@/components/global/loading";
import { useUpdateUserRoles } from "@/app/(admin)/admin/roles/hooks/use-update-user-roles";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useModal } from "@/stores/modal-store";
import { useGetAllRolePermissions } from "@/app/(admin)/admin/permissions/hooks/get-all-role-permissions";
import { User } from "@/queries/admin/roles/types";

interface UpdateUserRoleFormProps {
  user: User;
}

export const UpdateUserRoleForm = ({ user }: UpdateUserRoleFormProps) => {
  const { roleAndPermissions, error: rolesError } = useGetAllRolePermissions();
  const { updateUserRoleAsync, isPending: isUpdating } = useUpdateUserRoles();
  const [localRoles, setLocalRoles] = useState<string[]>(
    user.roles.map((r) => r.role.id)
  );

  const close = useModal((state) => state.close);

  const roles = roleAndPermissions?.roles ?? [];
  const isAdmin = useMemo(
    () =>
      localRoles.some((roleId) => {
        const role = roles.find((r) => r.id === roleId);
        return role?.name.toLowerCase() === "admin";
      }),
    [localRoles, roles]
  );

  const availableRoles = useMemo(() => {
    return roles.filter((role) => !localRoles.includes(role.id));
  }, [roles, localRoles]);

  const handleRoleChange = (roleId: string) => {
    if (!roleId) return;
    const selectedRole = roles.find((r) => r.id === roleId);
    if (selectedRole?.name.toLowerCase() === "admin") {
      setLocalRoles([roleId]);
    } else {
      setLocalRoles((prev) => [...prev, roleId]);
    }
  };

  const handleRemoveRole = (roleId: string) => {
    setLocalRoles((prev) => prev.filter((id) => id !== roleId));
  };

  const handleSubmit = async () => {
    await updateUserRoleAsync({ userId: user.id, roleIds: localRoles });
    close();
  };

  if (rolesError) return <Error />;

  return (
    <div className="space-y-6 rounded-lg">
      {/* User Info Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Email</Label>
            <Input
              value={user.email}
              disabled
              className="w-full bg-muted/50 text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Name</Label>
            <Input
              value={
                user.first_name || user.last_name
                  ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
                  : "N/A"
              }
              disabled
              className="w-full bg-muted/50 text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="font-semibold text-sm">Current Roles</Label>
        <div className="flex flex-wrap gap-2">
          {localRoles.length > 0 ? (
            localRoles.map((roleId) => {
              const role = roles.find((r) => r.id === roleId);
              return (
                <Badge
                  key={roleId}
                  variant="secondary"
                  className="flex items-center gap-1 text-sm py-1"
                >
                  {role?.name ?? "Unknown"}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-destructive/10"
                    onClick={() => handleRemoveRole(roleId)}
                    disabled={isUpdating}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })
          ) : (
            <Badge variant="outline" className="text-sm py-1">
              No roles assigned
            </Badge>
          )}
        </div>
      </div>

      {/* Add Role Section */}
      <div className="space-y-3">
        <Label className="font-semibold text-sm">Add Role</Label>
        <Select
          value=""
          onValueChange={handleRoleChange}
          disabled={isUpdating || isAdmin || availableRoles.length === 0}
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSubmit}
          disabled={isUpdating}
          className="min-w-[120px]"
        >
          {isUpdating ? <Loading /> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

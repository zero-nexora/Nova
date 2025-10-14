// @/components/UpdateUserRoleForm.tsx
"use client";

import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Error } from "@/components/global/error";
import { Loading } from "@/components/global/loading";
import { UserByRole } from "@/queries/admin/roles/types";
import { useGetAllPerrmissions } from "@/app/(admin)/admin/permissions/hooks/get-all-permissions";
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

interface UpdateUserRoleFormProps {
  user: UserByRole;
}

export const UpdateUserRoleForm = ({ user }: UpdateUserRoleFormProps) => {
  const { rolesAndPermissions, error: rolesError } = useGetAllPerrmissions();
  const { updateUserRoleAsync, isPending: isUpdating } = useUpdateUserRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [localRoles, setLocalRoles] = useState<string[]>(
    user.roles.map((r) => r.role.id)
  );

  const roles = rolesAndPermissions?.roles ?? [];

  // Filter available roles (exclude already assigned roles)
  const availableRoles = useMemo(() => {
    return roles.filter((role) => !localRoles.includes(role.id));
  }, [roles, localRoles]);

  // Handle adding a role
  const handleAddRole = () => {
    if (!selectedRoleId) return;
    setLocalRoles((prev) => [...prev, selectedRoleId]);
    setSelectedRoleId("");
  };

  // Handle removing a role
  const handleRemoveRole = (roleId: string) => {
    setLocalRoles((prev) => prev.filter((id) => id !== roleId));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      await updateUserRoleAsync({ userId: user.id, roleIds: localRoles });
    } catch (error) {
      console.log(error);
    }
  };

  if (rolesError) return <Error />;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="font-semibold">Email:</label>
          <Input value={user.email} disabled className="w-full" />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-semibold">Name:</label>
          <Input
            value={
              user.first_name || user.last_name
                ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
                : "N/A"
            }
            disabled
            className="w-full"
          />
        </div>
      </div>

      {/* Current Roles */}
      <div className="space-y-2">
        <label className="font-semibold">Current Roles:</label>
        <div className="flex flex-wrap gap-2">
          {localRoles.length > 0 ? (
            localRoles.map((roleId) => {
              const role = roles.find((r) => r.id === roleId);
              return (
                <Badge
                  key={roleId}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {role?.name ?? "Unknown"}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => handleRemoveRole(roleId)}
                    disabled={isUpdating}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })
          ) : (
            <Badge variant="outline">No roles assigned</Badge>
          )}
        </div>
      </div>

      {/* Add Role */}
      <div className="space-y-2">
        <label className="font-semibold">Add Role:</label>
        <div className="flex gap-2">
          <Select
            value={selectedRoleId}
            onValueChange={setSelectedRoleId}
            disabled={isUpdating || availableRoles.length === 0}
          >
            <SelectTrigger className="w-48">
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
          <Button
            onClick={handleAddRole}
            disabled={!selectedRoleId || isUpdating}
            className={cn(!selectedRoleId && "opacity-50 cursor-not-allowed")}
          >
            Add
          </Button>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isUpdating}
        className={cn(isUpdating && "opacity-50 cursor-not-allowed")}
      >
        {isUpdating ? <Loading /> : "Save Changes"}
      </Button>
    </div>
  );
};

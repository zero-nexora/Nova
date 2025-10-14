"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Error } from "@/components/global/error";
import { cn } from "@/lib/utils";
import { useUserRoleFilters } from "../hooks/use-user-filters";
import { useGetAllPerrmissions } from "../../permissions/hooks/get-all-permissions";

export const UserFilter = () => {
  const { filters, updateFilter, resetFilters } = useUserRoleFilters();
  const { rolesAndPermissions, error: rolesError } = useGetAllPerrmissions();

  const roles = rolesAndPermissions?.roles ?? [];

  if (rolesError) return <Error />;

  return (
    <div className="flex gap-4 items-center p-6">
      <Input
        placeholder="Search by name or email..."
        value={filters.search ?? ""}
        onChange={(e) => updateFilter("search", e.target.value)}
        className="max-w-md"
      />
      <Select
        value={filters.roleId ?? ""}
        onValueChange={(value) => updateFilter("roleId", value || undefined)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        onClick={resetFilters}
        className={cn(
          (!filters.search && !filters.roleId) && "opacity-50 cursor-not-allowed"
        )}
        disabled={!filters.search && !filters.roleId}
      >
        Reset Filters
      </Button>
    </div>
  );
};
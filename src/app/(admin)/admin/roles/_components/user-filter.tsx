"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Error } from "@/components/global/error";
import { useUserRoleFilters } from "../hooks/use-user-filters";
import { useGetAllPerrmissions } from "../../permissions/hooks/get-all-permissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const UserFilter = () => {
  const { filters, updateFilter, resetFilters } = useUserRoleFilters();
  const { rolesAndPermissions, error: rolesError } = useGetAllPerrmissions();
  const [tempFilters, setTempFilters] = useState({
    search: filters.search ?? "",
    roleId: filters.roleId ?? "",
  });

  const roles = rolesAndPermissions?.roles ?? [];

  if (rolesError) return <Error />;

  const handleApply = () => {
    updateFilter("search", tempFilters.search || "");
    updateFilter(
      "roleId",
      tempFilters.roleId === "all" ? "" : tempFilters.roleId || ""
    );
  };

  return (
    <div className="flex gap-4 items-center">
      <Input
        placeholder="Search by name or email..."
        value={tempFilters.search}
        onChange={(e) =>
          setTempFilters({ ...tempFilters, search: e.target.value })
        }
        className="max-w-md"
      />
      <Select
        value={tempFilters.roleId}
        onValueChange={(value) =>
          setTempFilters({ ...tempFilters, roleId: value || "" })
        }
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
      <Button variant="default" onClick={handleApply}>
        Apply Filters
      </Button>
      <Button
        variant="outline"
        onClick={resetFilters}
        className={cn(
          !filters.search && !filters.roleId && "opacity-50 cursor-not-allowed"
        )}
        disabled={!filters.search && !filters.roleId}
      >
        Reset Filters
      </Button>
    </div>
  );
};

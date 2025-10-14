"use client";

import { z } from "zod";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";

export const isDeletedValues = ["true", "false", "all"] as const;

export const GetUserByRoleSchema = z.object({
  roleId: z.string().uuid().optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().default(DEFAULT_LIMIT),
  page: z.number().int().positive().default(DEFAULT_PAGE),
});

export type UserRoleFilters = z.infer<typeof GetUserByRoleSchema>;

const params = {
  roleId: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),
  search: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),
  limit: parseAsInteger.withDefault(DEFAULT_LIMIT),
  page: parseAsInteger.withDefault(DEFAULT_PAGE),
};

export const useUserRoleFilters = () => {
  const [filters, setFilters] = useQueryStates(params, {
    shallow: true,
  });

  const resetFilters = () => {
    setFilters({
      roleId: "",
      search: "",
      limit: DEFAULT_LIMIT,
      page: DEFAULT_PAGE,
    });
  };

  const updateFilter = <K extends keyof UserRoleFilters>(
    key: K,
    value: UserRoleFilters[K]
  ) => {
    setFilters({ [key]: value, ...(key !== "page" && { page: 1 }) });
  };

  return {
    filters: filters as UserRoleFilters,
    setFilters,
    resetFilters,
    updateFilter,
  };
};

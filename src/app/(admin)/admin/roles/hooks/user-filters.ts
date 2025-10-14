import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";
import { createLoader, parseAsString, parseAsInteger } from "nuqs/server";

export const userRoleParams = {
  roleId: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),
  search: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),
  limit: parseAsInteger.withDefault(DEFAULT_LIMIT),
  page: parseAsInteger.withDefault(DEFAULT_PAGE),
};

export const loaderUserRoleFilters = createLoader(userRoleParams);

"use client";

import {
  useQueryStates,
  parseAsString,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";
import { z } from "zod";

export const isDeletedValues = ["true", "false", "all"] as const;

export const GetAllProductsSchema = z.object({
  limit: z.number().int().positive().default(10),
  page: z.number().int().positive().default(1),
  search: z.string().optional(),
  slugCategory: z.string().optional(),
  slugSubcategory: z.string().optional(),
  isDeleted: z.enum(isDeletedValues).optional(),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().nonnegative().optional(),
});

export type ProductFilters = z.infer<typeof GetAllProductsSchema>;

const params = {
  search: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),
  slugCategory: parseAsString
    .withOptions({ clearOnDefault: true })
    .withDefault(""),
  slugSubcategory: parseAsString
    .withOptions({ clearOnDefault: true })
    .withDefault(""),
  isDeleted: parseAsStringLiteral(isDeletedValues)
    .withOptions({ clearOnDefault: true })
    .withDefault("all"),
  priceMin: parseAsInteger.withOptions({ clearOnDefault: true }).withDefault(0),
  priceMax: parseAsInteger.withOptions({ clearOnDefault: true }).withDefault(0),
  limit: parseAsInteger.withDefault(DEFAULT_LIMIT),
  page: parseAsInteger.withDefault(DEFAULT_PAGE),
};

export const useProductFilters = () => {
  const [filters, setFilters] = useQueryStates(params, {
    shallow: true,
  });

  const resetFilters = () => {
    setFilters({
      limit: DEFAULT_LIMIT,
      page: DEFAULT_PAGE,
      search: "",
      slugCategory: "",
      slugSubcategory: "",
      isDeleted: "all",
      priceMin: 0,
      priceMax: 0,
    });
  };

  const updateFilter = <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => {
    setFilters({ [key]: value, ...(key !== "page" && { page: DEFAULT_PAGE }) });
  };

  return {
    filters: filters as ProductFilters,
    setFilters,
    resetFilters,
    updateFilter,
  };
};

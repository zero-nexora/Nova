import {
  createLoader,
  parseAsString,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs/server";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { isDeletedValues } from "./use-product-fillters";

export const params = {
  limit: parseAsInteger.withDefault(DEFAULT_LIMIT),
  page: parseAsInteger.withDefault(1),
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
};

export const loaderProductFilters = createLoader(params);

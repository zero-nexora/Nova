import {
  createLoader,
  parseAsString,
  parseAsArrayOf,
  parseAsStringLiteral,
  parseAsInteger,
} from "nuqs/server";
import { DEFAULT_LIMIT } from "@/lib/constants";

export const sortValues = [
  "curated",
  "trending",
  "hot_and_new",
  "price_asc",
  "price_desc",
  "name_asc",
  "name_desc",
  "newest",
  "oldest",
  "stock_high",
  "stock_low",
  "rating_high",
] as const;

export const sortOrderValues = ["asc", "desc"] as const;

export const params = {
  search: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),

  sortBy: parseAsStringLiteral(sortValues).withDefault("curated"),
  sortOrder: parseAsStringLiteral(sortOrderValues).withDefault("desc"),

  priceMin: parseAsInteger.withOptions({ clearOnDefault: true }).withDefault(0),
  priceMax: parseAsInteger.withOptions({ clearOnDefault: true }).withDefault(0),

  slugCategories: parseAsArrayOf(parseAsString)
    .withOptions({ clearOnDefault: true })
    .withDefault([]),
  slugSubcategories: parseAsArrayOf(parseAsString)
    .withOptions({ clearOnDefault: true })
    .withDefault([]),

  excludeSlugs: parseAsArrayOf(parseAsString)
    .withOptions({ clearOnDefault: true })
    .withDefault([]),

  limit: parseAsInteger.withDefault(DEFAULT_LIMIT),
};

export const loaderProductFilters = createLoader(params);

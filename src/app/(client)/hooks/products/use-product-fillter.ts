import { DEFAULT_LIMIT } from "@/lib/constants";
import { GetInfiniteProductsSchema } from "@/queries/client/products/types";
import {
  useQueryStates,
  parseAsString,
  parseAsArrayOf,
  parseAsStringLiteral,
  parseAsInteger,
} from "nuqs";
import z from "zod";

export type ProductFilters = z.infer<typeof GetInfiniteProductsSchema>;

const sortValues = [
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
const sortOrderValues = ["asc", "desc"] as const;

export const params = {
  search: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),

  sortBy: parseAsStringLiteral(sortValues).withDefault("curated"),
  sortOrder: parseAsStringLiteral(sortOrderValues).withDefault("desc"),

  priceMin: parseAsInteger.withOptions({ clearOnDefault: true }).withDefault(0),
  priceMax: parseAsInteger.withOptions({ clearOnDefault: true }).withDefault(0),

  slugCategory: parseAsString
    .withOptions({ clearOnDefault: true })
    .withDefault(""),
  slugSubcategory: parseAsString
    .withOptions({ clearOnDefault: true })
    .withDefault(""),

  excludeSlugs: parseAsArrayOf(parseAsString)
    .withOptions({ clearOnDefault: true })
    .withDefault([]),

  limit: parseAsInteger.withDefault(DEFAULT_LIMIT),
};

export const useProductFilters = () => {
  return useQueryStates(params);
};

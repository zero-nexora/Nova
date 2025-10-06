import {
  useQueryStates,
  parseAsString,
  parseAsArrayOf,
  parseAsStringLiteral,
  parseAsInteger,
} from "nuqs";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { z } from "zod";
import { GetInfiniteProductsSchema } from "@/queries/client/products/types";

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

type SortBy = (typeof sortValues)[number];
type SortOrder = (typeof sortOrderValues)[number];

const params = {
  search: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),
  sortBy: parseAsStringLiteral(sortValues).withDefault("curated" as SortBy),
  sortOrder: parseAsStringLiteral(sortOrderValues).withDefault(
    "desc" as SortOrder
  ),
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

export const useProductFilters = () => {
  const [filters, setFilters] = useQueryStates(params, {
    shallow: true,
  });

  const resetFilters = () => {
    setFilters({
      search: "",
      sortBy: "curated",
      sortOrder: "desc",
      priceMin: 0,
      priceMax: 0,
      slugCategories: [],
      slugSubcategories: [],
      excludeSlugs: [],
      limit: DEFAULT_LIMIT,
    });
  };

  const updateFilter = <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => {
    setFilters({ [key]: value });
  };

  const toggleSlug = (
    key: "slugCategories" | "slugSubcategories" | "excludeSlugs",
    slug: string
  ) => {
    setFilters((prev) => {
      const currentSlugs = prev[key] || [];
      if (currentSlugs.includes(slug)) {
        return {
          ...prev,
          [key]: currentSlugs.filter((s) => s !== slug),
        };
      }
      return {
        ...prev,
        [key]: [...currentSlugs, slug],
      };
    });
  };

  return {
    filters: filters as ProductFilters,
    setFilters,
    resetFilters,
    updateFilter,
    toggleSlug,
  };
};

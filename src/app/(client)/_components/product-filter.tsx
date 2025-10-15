import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useProductFilters } from "../hooks/products/use-product-fillters";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllCategories } from "../hooks/categories/use-get-all-categories";

interface ProductFilterProps {
  onClose?: () => void;
}

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

const PRICE_RANGES: PriceRange[] = [
  { id: "all", label: "All Prices", min: 0, max: 0 },
  { id: "0-10", label: "0 - 10$", min: 0, max: 10 },
  { id: "11-20", label: "11 - 20$", min: 11, max: 20 },
  { id: "21-50", label: "21 - 50$", min: 21, max: 50 },
  { id: "51-100", label: "51 - 100$", min: 51, max: 100 },
  { id: "101+", label: "> 100$", min: 101, max: 999999 },
];

const SORT_VALUES = [
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

const SORT_ORDER_VALUES = ["asc", "desc"] as const;

type SortValue = (typeof SORT_VALUES)[number];
type SortOrderValue = (typeof SORT_ORDER_VALUES)[number];

export default function ProductFilter({ onClose }: ProductFilterProps) {
  const { filters, setFilters, resetFilters } = useProductFilters();
  const { categories } = useGetAllCategories();

  const [tempFilters, setTempFilters] = useState({
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    priceMin: filters.priceMin || 0,
    priceMax: filters.priceMax || 0,
    slugCategories: filters.slugCategories || [],
    slugSubcategories: filters.slugSubcategories || [],
  });

  const handlePriceChange = (value: string) => {
    const selectedRange = PRICE_RANGES.find((range) => range.id === value);
    if (selectedRange) {
      setTempFilters((prev) => ({
        ...prev,
        priceMin: selectedRange.min,
        priceMax: selectedRange.max,
      }));
    }
  };

  const toggleSlug = (
    key: "slugCategories" | "slugSubcategories",
    slug: string
  ) => {
    setTempFilters((prev) => {
      const currentSlugs = prev[key] || [];
      const newSlugs = currentSlugs.includes(slug)
        ? currentSlugs.filter((s) => s !== slug)
        : [...currentSlugs, slug];
      return { ...prev, [key]: newSlugs };
    });
  };

  const applyFilters = async () => {
    try {
      await setFilters({
        ...tempFilters,
        limit: filters.limit,
        excludeSlugs: filters.excludeSlugs,
      });
      onClose?.();
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const handleClearFilters = () => {
    resetFilters();
    onClose?.();
    setTempFilters({
      sortBy: "curated",
      sortOrder: "desc",
      priceMin: 0,
      priceMax: 0,
      slugCategories: [],
      slugSubcategories: [],
    });
  };

  const currentPriceRangeId =
    PRICE_RANGES.find(
      (range) =>
        range.min === tempFilters.priceMin && range.max === tempFilters.priceMax
    )?.id || "all";

  const isSubcategoryDisabled = (subcategorySlug: string) => {
    return categories.some(
      (category: { slug: string; subcategories: { slug: string }[] }) =>
        tempFilters.slugCategories.includes(category.slug) &&
        category.subcategories?.some((sub) => sub.slug === subcategorySlug)
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b pb-4 mb-6 flex flex-col sm:flex-row gap-3">
        <Button onClick={applyFilters} className="w-full sm:flex-1">
          Apply Filters
        </Button>
        <Button
          onClick={handleClearFilters}
          variant="outline"
          className="w-full sm:flex-1"
        >
          Clear Filters
        </Button>
      </div>

      <div className="flex-1">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sortBy" className="text-sm font-medium">
                Sort By
              </Label>
              <Select
                value={tempFilters.sortBy}
                onValueChange={(value) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    sortBy: value as SortValue,
                  }))
                }
              >
                <SelectTrigger id="sortBy" className="mt-1 w-full">
                  <SelectValue placeholder="Select sort option" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_VALUES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value.replace("_", " ").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sortOrder" className="text-sm font-medium">
                Sort Order
              </Label>
              <Select
                value={tempFilters.sortOrder}
                onValueChange={(value) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    sortOrder: value as SortOrderValue,
                  }))
                }
              >
                <SelectTrigger id="sortOrder" className="mt-1 w-full">
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_ORDER_VALUES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="priceRange" className="text-sm font-medium">
                Price Range
              </Label>
              <Select
                value={currentPriceRangeId}
                onValueChange={handlePriceChange}
              >
                <SelectTrigger id="priceRange" className="mt-1 w-full">
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_RANGES.map((range) => (
                    <SelectItem key={range.id} value={range.id}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Categories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((category: { slug: string; name: string }) => (
                <div
                  key={category.slug}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`category-${category.slug}`}
                    checked={tempFilters.slugCategories.includes(category.slug)}
                    onCheckedChange={() =>
                      toggleSlug("slugCategories", category.slug)
                    }
                  />
                  <Label
                    htmlFor={`category-${category.slug}`}
                    className="text-sm cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Subcategories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.flatMap(
                (category: {
                  slug: string;
                  subcategories: { slug: string; name: string }[];
                }) =>
                  category.subcategories?.map((subcategory) => {
                    const isDisabled = isSubcategoryDisabled(subcategory.slug);
                    return (
                      <div
                        key={subcategory.slug}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`subcategory-${subcategory.slug}`}
                          checked={tempFilters.slugSubcategories.includes(
                            subcategory.slug
                          )}
                          onCheckedChange={() =>
                            toggleSlug("slugSubcategories", subcategory.slug)
                          }
                          disabled={isDisabled}
                        />
                        <Label
                          htmlFor={`subcategory-${subcategory.slug}`}
                          className={`text-sm cursor-pointer ${
                            isDisabled ? "text-muted-foreground" : ""
                          }`}
                        >
                          {subcategory.name}
                        </Label>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductFilterSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(3)].map((_, index) => (
          <div key={index}>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>

      <div>
        <Skeleton className="h-5 w-24 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="h-5 w-24 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <Skeleton className="h-10 w-full sm:flex-1" />
        <Skeleton className="h-10 w-full sm:flex-1" />
      </div>
    </div>
  );
}

import { useState } from "react";
import { useCategoriesStore } from "@/stores/client/categories-store";
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
import { useProductFilters } from "../hooks/products/use-product-fillter";
import { Skeleton } from "@/components/ui/skeleton";

// Cập nhật priceRanges với id duy nhất
const priceRanges = [
  { id: "all", label: "All Prices", min: 0, max: 0 },
  { id: "0-10", label: "0 - 10$", min: 0, max: 10 },
  { id: "11-20", label: "11 - 20$", min: 11, max: 20 },
  { id: "21-50", label: "21 - 50$", min: 21, max: 50 },
  { id: "51-100", label: "51 - 100$", min: 51, max: 100 },
  { id: "101+", label: "> 100$", min: 101, max: 999999 },
];

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

export default function ProductFilter() {
  const { filters, setFilters, resetFilters } = useProductFilters();
  const { categories, loading: isLoading } = useCategoriesStore();

  // State nội bộ để theo dõi các thay đổi tạm thời
  const [tempFilters, setTempFilters] = useState({
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    priceMin: filters.priceMin || 0,
    priceMax: filters.priceMax || 0,
    slugCategories: filters.slugCategories || [],
    slugSubcategories: filters.slugSubcategories || [],
  });

  // Xử lý thay đổi giá
  const handlePriceChange = (value: string) => {
    const selectedRange = priceRanges.find((range) => range.id === value);
    if (selectedRange) {
      setTempFilters((prev) => ({
        ...prev,
        priceMin: selectedRange.min,
        priceMax: selectedRange.max,
      }));
    }
  };

  // Xử lý toggle slug cho categories và subcategories
  const toggleTempSlug = (
    key: "slugCategories" | "slugSubcategories",
    slug: string
  ) => {
    setTempFilters((prev) => {
      const currentSlugs = prev[key] || [];
      if (currentSlugs.includes(slug)) {
        return { ...prev, [key]: currentSlugs.filter((s) => s !== slug) };
      }
      return { ...prev, [key]: [...currentSlugs, slug] };
    });
  };

  // Xử lý khi nhấn Apply
  const applyFilters = async () => {
    try {
      // Cập nhật toàn bộ filters qua setFilters
      await setFilters({
        ...tempFilters,
        limit: filters.limit,
        excludeSlugs: filters.excludeSlugs,
      });
      console.log("Applying filters:", tempFilters);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  // Xử lý khi nhấn Clear
  const handleClearFilters = () => {
    resetFilters();
    setTempFilters({
      sortBy: "curated",
      sortOrder: "desc",
      priceMin: 0,
      priceMax: 0,
      slugCategories: [],
      slugSubcategories: [],
    });
  };

  // Tìm range hiện tại để hiển thị trong Select
  const currentPriceRange =
    priceRanges.find(
      (range) =>
        range.min === tempFilters.priceMin && range.max === tempFilters.priceMax
    )?.id || "all";

  // Hàm kiểm tra xem subcategory có thuộc category đã chọn không
  const isSubcategoryDisabled = (subcategorySlug: string) => {
    return categories.some(
      (category: { slug: string; subcategories: { slug: string }[] }) =>
        tempFilters.slugCategories.includes(category.slug) &&
        category.subcategories?.some((sub) => sub.slug === subcategorySlug)
    );
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sort By Select */}
        <div>
          <Label htmlFor="sortBy" className="text-sm font-medium">
            Sort By
          </Label>
          <Select
            value={tempFilters.sortBy}
            onValueChange={(value) =>
              setTempFilters((prev) => ({
                ...prev,
                sortBy: value as (typeof sortValues)[number],
              }))
            }
          >
            <SelectTrigger id="sortBy" className="mt-1 w-full">
              <SelectValue placeholder="Select sort option" />
            </SelectTrigger>
            <SelectContent>
              {sortValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {value.replace("_", " ").toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order Select */}
        <div>
          <Label htmlFor="sortOrder" className="text-sm font-medium">
            Sort Order
          </Label>
          <Select
            value={tempFilters.sortOrder}
            onValueChange={(value) =>
              setTempFilters((prev) => ({
                ...prev,
                sortOrder: value as (typeof sortOrderValues)[number],
              }))
            }
          >
            <SelectTrigger id="sortOrder" className="mt-1 w-full">
              <SelectValue placeholder="Select order" />
            </SelectTrigger>
            <SelectContent>
              {sortOrderValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {value.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Select */}
        <div>
          <Label htmlFor="priceRange" className="text-sm font-medium">
            Price Range
          </Label>
          <Select value={currentPriceRange} onValueChange={handlePriceChange}>
            <SelectTrigger id="priceRange" className="mt-1 w-full">
              <SelectValue placeholder="Select price range" />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map((range) => (
                <SelectItem key={range.id} value={range.id}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <ProductFilterSkeleton />
      ) : (
        <>
          {/* Categories Checkboxes */}
          <div className="mt-4">
            <h3 className="text-sm font-medium">Categories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {categories.map((category: { slug: string; name: string }) => (
                <div
                  key={category.slug}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`category-${category.slug}`}
                    checked={tempFilters.slugCategories.includes(category.slug)}
                    onCheckedChange={() =>
                      toggleTempSlug("slugCategories", category.slug)
                    }
                  />
                  <Label
                    htmlFor={`category-${category.slug}`}
                    className="text-sm"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Subcategories Checkboxes */}
          <div className="mt-4">
            <h3 className="text-sm font-medium">Subcategories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {categories.flatMap(
                (category: {
                  slug: string;
                  subcategories: { slug: string; name: string }[];
                }) =>
                  category.subcategories?.map((subcategory) => (
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
                          toggleTempSlug("slugSubcategories", subcategory.slug)
                        }
                        disabled={isSubcategoryDisabled(subcategory.slug)}
                      />
                      <Label
                        htmlFor={`subcategory-${subcategory.slug}`}
                        className={`text-sm ${
                          isSubcategoryDisabled(subcategory.slug)
                            ? "text-muted-foreground"
                            : ""
                        }`}
                      >
                        {subcategory.name}
                      </Label>
                    </div>
                  ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Apply and Clear Buttons */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Button onClick={applyFilters} className="w-full sm:w-auto">
          Apply Filters
        </Button>
        <Button onClick={handleClearFilters} className="w-full sm:w-auto">
          Clear Filters
        </Button>
      </div>
    </div>
  );
}

export function ProductFilterSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Categories Checkboxes Skeleton */}
      <div className="mt-4">
        <Skeleton className="h-5 w-24 mb-2" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Subcategories Checkboxes Skeleton */}
      <div className="mt-4">
        <Skeleton className="h-5 w-24 mb-2" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Apply and Clear Buttons Skeleton */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Skeleton className="h-10 w-full sm:w-32" />
        <Skeleton className="h-10 w-full sm:w-32" />
      </div>
    </div>
  );
}

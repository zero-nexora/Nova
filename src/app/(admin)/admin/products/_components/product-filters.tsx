"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  ProductFilters,
  useProductFilters,
} from "../hooks/products/use-product-fillters";
import { DEFAULT_PAGE } from "@/lib/constants";
import { Category } from "@/queries/admin/categories/types";

interface ProductFiltersProps {
  filters: ProductFilters;
  categories: Category[];
}

export const ProductFiltersComponent = ({
  filters,
  categories,
}: ProductFiltersProps) => {
  const { resetFilters, setFilters } = useProductFilters();
  const [tempFilters, setTempFilters] = useState<ProductFilters>(filters);

  const subcategories =
    categories.find((c) => c.slug === tempFilters.slugCategory)
      ?.subcategories || [];

  const handleSearchChange = (value: string) => {
    setTempFilters({ ...tempFilters, search: value });
  };

  const handleCategoryChange = (value: string) => {
    setTempFilters({
      ...tempFilters,
      slugCategory: value === "all" ? "" : value,
      slugSubcategory: "all",
    });
  };

  const handleSubcategoryChange = (value: string) => {
    setTempFilters({
      ...tempFilters,
      slugSubcategory: value === "all" ? "" : value,
    });
  };

  const handleDeletedFilterChange = (value: "true" | "false" | "all") => {
    setTempFilters({ ...tempFilters, isDeleted: value });
  };

  const handlePriceChange = (type: "priceMin" | "priceMax", value: string) => {
    const numValue = value === "" ? 0 : Number(value);
    setTempFilters({ ...tempFilters, [type]: numValue });
  };

  const handleApplyFilters = () => {
    setFilters({
      ...tempFilters,
      page: DEFAULT_PAGE,
    });
  };

  const handleClearFilters = () => {
    setTempFilters({
      limit: filters.limit,
      page: 1,
      search: "",
      slugCategory: "",
      slugSubcategory: "",
      isDeleted: "all",
      priceMin: 0,
      priceMax: 0,
    });
    resetFilters();
  };

  return (
    <Card className="bg-muted/10 border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={tempFilters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <Select
              value={tempFilters.slugCategory || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.slug} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Subcategory</Label>
            <Select
              value={tempFilters.slugSubcategory || "all"}
              onValueChange={handleSubcategoryChange}
              disabled={!tempFilters.slugCategory || subcategories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="All subcategories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subcategories</SelectItem>
                {subcategories.map((subcategory) => (
                  <SelectItem key={subcategory.slug} value={subcategory.slug}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select
              value={tempFilters.isDeleted || "all"}
              onValueChange={handleDeletedFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Active only</SelectItem>
                <SelectItem value="true">Deleted only</SelectItem>
                <SelectItem value="all">All products</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium">Price Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min price"
                value={tempFilters.priceMin || ""}
                onChange={(e) => handlePriceChange("priceMin", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max price"
                value={tempFilters.priceMax || ""}
                onChange={(e) => handlePriceChange("priceMax", e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 md:col-span-2 lg:col-span-1 items-end">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

"use client";

import React from "react";
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
import { Filter, Search, RefreshCw } from "lucide-react";
import { ProductFilters } from "../hooks/types";

interface Category {
  id: string;
  name: string;
  subcategories?: Array<{ id: string; name: string }>;
}

interface ProductFiltersProps {
  filters: ProductFilters;
  categories: Category[];
  onFiltersChange: (filters: Partial<ProductFilters>) => void;
  onClearFilters: () => void;
}

export const ProductFiltersComponent = ({
  filters,
  categories,
  onFiltersChange,
  onClearFilters,
}: ProductFiltersProps) => {
  const subcategories =
    categories.find((c) => c.id === filters.categoryId)?.subcategories || [];

  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      categoryId: value,
      subcategoryId: "",
    });
  };

  const handleSubcategoryChange = (value: string) => {
    onFiltersChange({ subcategoryId: value });
  };

  const handleDeletedFilterChange = (value: "true" | "false" | "all") => {
    onFiltersChange({ deletedFilter: value });
  };

  const handlePriceRangeChange = (type: "min" | "max", value: string) => {
    onFiltersChange({
      priceRange: {
        ...filters.priceRange,
        [type]: value,
      },
    });
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
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={filters.categoryId}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All categories
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Subcategory</label>
            <Select
              value={filters.subcategoryId}
              onValueChange={handleSubcategoryChange}
              disabled={!filters.categoryId || subcategories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="All subcategories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subcategories</SelectItem>
                {subcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.deletedFilter}
              onValueChange={handleDeletedFilterChange}
            >
              <SelectTrigger>
                <SelectValue />
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
            <label className="text-sm font-medium">Price Range</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min price"
                value={filters.priceRange.min}
                onChange={(e) => handlePriceRangeChange("min", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max price"
                value={filters.priceRange.max}
                onChange={(e) => handlePriceRangeChange("max", e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 md:col-span-2 lg:col-span-1 items-end">
            <Button variant="outline" onClick={onClearFilters}>
              Clear Filters
            </Button>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

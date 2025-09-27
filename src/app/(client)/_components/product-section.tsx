"use client";

import React from "react";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { useInfiniteProducts } from "../hooks/products/use-infinity-products";
import { InfiniteScroll } from "@/components/global/infinite-scroll";
import {
  ProductFilters,
  useProductFilters,
} from "../hooks/products/use-product-fillter";
import { ProductSectionHeader } from "./product-section-header";
import { ProductGridSkeleton } from "./product-grid-skeleton";
import { ProductEmptyState } from "./product-empty-state";
import { ProductGrid } from "./product-grid";

interface ProductSectionProps {
  limit?: number;
  sortBy?: "created_at" | "name" | "price";
  sortOrder?: "asc" | "desc";
  categoryId?: string;
  subcategoryId?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  title?: string;
  description?: string;
}

export const ProductSection = ({
  limit = DEFAULT_LIMIT,
  sortBy = "created_at",
  sortOrder = "desc",
  categoryId,
  subcategoryId,
  searchQuery,
  minPrice,
  maxPrice,
  title,
  description,
}: ProductSectionProps) => {
  const filters: ProductFilters = useProductFilters({
    limit,
    sortBy,
    sortOrder,
    categoryId,
    subcategoryId,
    searchQuery,
    minPrice,
    maxPrice,
  });

  const {
    products,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    error,
  } = useInfiniteProducts(filters);

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProductSectionHeader title={title} description={description} />
        <ProductGridSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProductEmptyState
          title="Error loading products"
          description="Something went wrong. Please try again later."
          isError
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductSectionHeader title={title} description={description} />

      {products && products.length > 0 ? (
        <>
          <ProductGrid products={products} />

          <div className="mt-8">
            <InfiniteScroll
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              showSkeleton={true}
              skeletonCount={8}
            />
          </div>
        </>
      ) : (
        <ProductEmptyState
          title="No products found"
          description="We couldn't find any products matching your criteria. Please try adjusting your filters."
        />
      )}
    </div>
  );
};

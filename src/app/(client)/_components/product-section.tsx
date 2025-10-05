"use client";

import React from "react";
import { useInfiniteProducts } from "../hooks/products/use-infinity-products";
import { InfiniteScroll } from "@/components/global/infinite-scroll";
import { ProductSectionHeader } from "./product-section-header";
import { ProductEmptyState } from "./product-empty-state";
import { ProductGrid, ProductGridSkeleton } from "./product-grid";
import { useProductFilters } from "../hooks/products/use-product-fillters";

interface ProductSectionProps {
  title?: string;
  description?: string;
  slugCategories?: string[];
  slugSubcategories?: string[];
  excludeSlugs?: string[];
}

export const ProductSection = ({
  title,
  description,
  slugCategories,
  slugSubcategories,
  excludeSlugs,
}: ProductSectionProps) => {
  const { filters } = useProductFilters();
  
  const {
    products,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    error,
  } = useInfiniteProducts({
    ...filters,
    slugCategories: slugCategories ?? filters.slugCategories,
    slugSubcategories: slugSubcategories ?? filters.slugSubcategories,
    excludeSlugs,
  });

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

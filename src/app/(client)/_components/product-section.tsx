"use client";

import React from "react";
import { useInfiniteProducts } from "../hooks/products/use-infinity-products";
import { InfiniteScroll } from "@/components/global/infinite-scroll";
import { ProductSectionHeader } from "./product-section-header";
import { ProductEmptyState } from "./product-empty-state";
import { ProductGrid, ProductGridSkeleton } from "./product-grid";
import { useProductFilters } from "../hooks/products/use-product-fillters";
import { Button } from "@/components/ui/button";
import { useDeleteWishlistMultiple } from "../wishlist/hooks/use-delete-wishlist-multiple";

interface ProductSectionProps {
  title?: string;
  description?: string;
  slugCategories?: string[];
  slugSubcategories?: string[];
  excludeSlugs?: string[];
  wishlist?: boolean;
}

export const ProductSection = ({
  title,
  description,
  slugCategories,
  slugSubcategories,
  excludeSlugs,
  wishlist,
}: ProductSectionProps) => {
  const { filters } = useProductFilters();
  const {
    deleteWishlistMultipleAsync,
    isPending: deleteWishlistMultiplePending,
  } = useDeleteWishlistMultiple();

  const {
    products,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isPendingProducts,
    error,
  } = useInfiniteProducts({
    ...filters,
    slugCategories: slugCategories ?? filters.slugCategories,
    slugSubcategories: slugSubcategories ?? filters.slugSubcategories,
    excludeSlugs,
    wishlist,
  });

  const handleDeleteWishlistMultiple = async () => {
    await deleteWishlistMultipleAsync({
      wishlistIds: products.map((product) => product.wishlist?.id) as string[],
    });
  };

  if (isPendingProducts) {
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
    <div>
      <ProductSectionHeader title={title} description={description} />

      {products && products.length > 0 ? (
        <div>
          {wishlist && (
            <Button
              className="mb-5"
              disabled={deleteWishlistMultiplePending}
              onClick={handleDeleteWishlistMultiple}
            >
              Clear all
            </Button>
          )}

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
        </div>
      ) : (
        <ProductEmptyState
          title="No products found"
          description="We couldn't find any products matching your criteria. Please try adjusting your filters."
        />
      )}
    </div>
  );
};

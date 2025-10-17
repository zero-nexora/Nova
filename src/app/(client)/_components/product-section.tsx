"use client";

import { Button } from "@/components/ui/button";
import { Error } from "@/components/global/error";
import { Empty } from "@/components/global/empty";
import { useConfirm } from "@/stores/confirm-store";
import { ProductGrid, ProductGridSkeleton } from "./product-grid";
import { InfiniteScroll } from "@/components/global/infinite-scroll";
import { useProductFilters } from "../hooks/products/use-product-fillters";
import { useInfiniteProducts } from "../hooks/products/use-infinity-products";
import { useDeleteWishlistMultiple } from "../wishlist/hooks/use-delete-wishlist-multiple"

interface ProductSectionProps {
  slugCategories?: string[];
  slugSubcategories?: string[];
  excludeSlugs?: string[];
  wishlist?: boolean;
}

export const ProductSection = ({
  slugCategories,
  slugSubcategories,
  excludeSlugs,
  wishlist,
}: ProductSectionProps) => {
  const { filters } = useProductFilters();
  const open = useConfirm((state) => state.open);
  const {
    deleteWishlistMultipleAsync,
    isPending: deleteWishlistMultiplePending,
  } = useDeleteWishlistMultiple();

  const { products, fetchNextPage, hasNextPage, isFetchingNextPage, error } =
    useInfiniteProducts({
      ...filters,
      slugCategories: slugCategories ?? filters.slugCategories,
      slugSubcategories: slugSubcategories ?? filters.slugSubcategories,
      excludeSlugs,
      wishlist,
    });

  const handleDeleteWishlistMultiple = async () => {
    open({
      title: "Clear Wishlist",
      description: "Are you sure you want to remove all items from your wishlist?",
      onConfirm: async () => {
        await deleteWishlistMultipleAsync({
          wishlistIds: products.map((product) => product.wishlist?.id) as string[],
        });
      },
    })
  };

  if (error) return <Error />;

  if (products && products.length === 0) return <Empty />;

  return (
    <div className="container mx-auto mb-8">
      <div className="flex justify-between items-center">
        {wishlist && products && products.length > 0 && (
          <Button
            disabled={deleteWishlistMultiplePending}
            onClick={handleDeleteWishlistMultiple}
            variant="outline"
            className="shrink-0 mb-6"
          >
            Clear all
          </Button>
        )}
      </div>

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
  );
};

export const ProductSectionSkeleton = () => {
  return <ProductGridSkeleton />;
};

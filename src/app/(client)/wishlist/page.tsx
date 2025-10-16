import { normalizeFilters } from "@/lib/utils";
import { getQueryClient, trpc } from "@/trpc/server";
import { loaderProductFilters } from "../hooks/products/product-filters";
import { DEFAULT_LIMIT } from "@/lib/constants";
import type { SearchParams } from "nuqs/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  ProductSection,
  ProductSectionSkeleton,
} from "../_components/product-section";
import { Suspense } from "react";
import { ProductSectionHeader } from "../_components/product-section-header";

interface WishlistPageProps {
  searchParams: Promise<SearchParams>;
}

const WishlistPage = async ({ searchParams }: WishlistPageProps) => {
  const queryClient = getQueryClient();
  const filters = await loaderProductFilters(searchParams);
  const normalizedFilters = normalizeFilters(filters);

  void queryClient.prefetchInfiniteQuery(
    trpc.client.productsRouterClient.getAll.infiniteQueryOptions({
      ...normalizedFilters,
      limit: DEFAULT_LIMIT,
      wishlist: true,
    })
  );

  return (
    <main>
      <ProductSectionHeader
        title="Your Wishlist"
        description="All the products you love, saved in one place for easy access and quick shopping."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<ProductSectionSkeleton />}>
          <ProductSection wishlist={true} />
        </Suspense>
      </HydrationBoundary>
    </main>
  );
};

export default WishlistPage;

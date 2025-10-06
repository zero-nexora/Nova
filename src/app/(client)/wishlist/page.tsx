import { normalizeFilters } from "@/lib/utils";
import { getQueryClient, trpc } from "@/trpc/server";
import { loaderProductFilters } from "../hooks/products/product-filters";
import { DEFAULT_LIMIT } from "@/lib/constants";
import type { SearchParams } from "nuqs/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ProductSection } from "../_components/product-section";

interface WishlistPageProps {
  searchParams: Promise<SearchParams>;
}

const WishlistPage = async ({ searchParams }: WishlistPageProps) => {
  const queryClient = getQueryClient();
  const filters = await loaderProductFilters(searchParams);
  const normalizedFilters = normalizeFilters({
    ...filters,
  });

  await queryClient.prefetchInfiniteQuery(
    trpc.client.productsRouterClient.getAll.infiniteQueryOptions({
      ...normalizedFilters,
      limit: DEFAULT_LIMIT,
      wishlist: true,
    })
  );

  return (
    <main className="min-h-screen">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductSection
          title="Your Wishlist"
          description="Save the products you love to revisit later. Easily manage, compare, and purchase your favorite items when you’re ready."
          wishlist={true}
        />
      </HydrationBoundary>
    </main>
  );
};

export default WishlistPage;

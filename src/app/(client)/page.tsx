import { Suspense } from "react";
import { normalizeFilters } from "@/lib/utils";
import type { SearchParams } from "nuqs/server";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { loaderProductFilters } from "./hooks/products/product-filters";
import { ProductSectionHeader } from "./_components/product-section-header";
import {
  ProductSection,
  ProductSectionSkeleton,
} from "./_components/product-section";

interface HomePageProps {
  searchParams: Promise<SearchParams>;
}

const HomePage = async ({ searchParams }: HomePageProps) => {
  const queryClient = getQueryClient();
  const filters = await loaderProductFilters(searchParams);
  const normalizedFilters = normalizeFilters(filters);

  void queryClient.prefetchInfiniteQuery(
    trpc.client.productsRouterClient.getAll.infiniteQueryOptions({
      ...normalizedFilters,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <main>
      <ProductSectionHeader
        title="Featured Products"
        description="Discover our best-selling and most-loved items handpicked just for you."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<ProductSectionSkeleton />}>
          <ProductSection />
        </Suspense>
      </HydrationBoundary>
    </main>
  );
};

export default HomePage;

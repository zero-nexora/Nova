import { getQueryClient, trpc } from "@/trpc/server";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ProductSection } from "./_components/product-section";
import { loaderProductFilters } from "./hooks/products/product-filters";
import type { SearchParams } from "nuqs/server";
import { normalizeFilters } from "@/lib/utils";

interface HomePageProps {
  searchParams: Promise<SearchParams>;
}

const HomePage = async ({ searchParams }: HomePageProps) => {
  const queryClient = getQueryClient();
  const filters = await loaderProductFilters(searchParams);
  const normalizedFilters = normalizeFilters(filters);

  await queryClient.prefetchInfiniteQuery(
    trpc.client.productsRouterClient.getAll.infiniteQueryOptions({
      ...normalizedFilters,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <main className="flex flex-col min-h-screen">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductSection />
      </HydrationBoundary>
    </main>
  );
};

export default HomePage;

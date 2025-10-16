import { Suspense } from "react";
import { normalizeFilters } from "@/lib/utils";
import { DEFAULT_LIMIT } from "@/lib/constants";
import type { SearchParams } from "nuqs/server";
import { getQueryClient, trpc } from "@/trpc/server";
import { CategoryBanner } from "./_components/category-banner";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { loaderProductFilters } from "../../hooks/products/product-filters";
import {
  ProductSection,
  ProductSectionSkeleton,
} from "../../_components/product-section";

interface CategoriesPageProps {
  params: Promise<{ slugCategory: string }>;
  searchParams: Promise<SearchParams>;
  excludeSlugs?: string[];
}

const CategoriesPage = async ({
  params,
  searchParams,
}: CategoriesPageProps) => {
  const { slugCategory } = await params;
  const queryClient = getQueryClient();
  const filters = await loaderProductFilters(searchParams);
  const normalizedFilters = normalizeFilters({
    ...filters,
    slugCategories: [slugCategory],
  });

  void queryClient.prefetchInfiniteQuery(
    trpc.client.productsRouterClient.getAll.infiniteQueryOptions({
      ...normalizedFilters,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <main>
      <CategoryBanner slugCategory={slugCategory} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<ProductSectionSkeleton />}>
          <ProductSection slugCategories={[slugCategory]} />
        </Suspense>
      </HydrationBoundary>
    </main>
  );
};

export default CategoriesPage;

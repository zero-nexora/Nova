import { Suspense } from "react";
import { normalizeFilters } from "@/lib/utils";
import type { SearchParams } from "nuqs/server";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { getQueryClient, trpc } from "@/trpc/server";
import { SubcategoryBanner } from "./_components/subcategory-banner";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { loaderProductFilters } from "@/app/(client)/hooks/products/product-filters";
import {
  ProductSection,
  ProductSectionSkeleton,
} from "@/app/(client)/_components/product-section";

interface CategoriesPageProps {
  params: Promise<{ slugCategory: string; slugSubcategory: string }>;
  searchParams: Promise<SearchParams>;
  excludeSlugs?: string[];
}

const CategoriesPage = async ({
  params,
  searchParams,
}: CategoriesPageProps) => {
  const { slugCategory, slugSubcategory } = await params;
  const queryClient = getQueryClient();
  const filters = await loaderProductFilters(searchParams);
  const normalizedFilters = normalizeFilters({
    ...filters,
    slugCategories: [...filters.slugCategories, slugCategory],
    slugSubcategories: [slugSubcategory],
  });

  void queryClient.prefetchInfiniteQuery(
    trpc.client.productsRouterClient.getAll.infiniteQueryOptions({
      ...normalizedFilters,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <main>
      <SubcategoryBanner
        slugCategory={slugCategory}
        slugSubcategory={slugSubcategory}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<ProductSectionSkeleton />}>
          <ProductSection
            title="Our Products"
            description="Discover our curated selection of products in this subcategory. Find the perfect items that match your style and needs."
            slugCategories={[slugCategory]}
            slugSubcategories={[slugSubcategory]}
          />
        </Suspense>
      </HydrationBoundary>
    </main>
  );
};

export default CategoriesPage;

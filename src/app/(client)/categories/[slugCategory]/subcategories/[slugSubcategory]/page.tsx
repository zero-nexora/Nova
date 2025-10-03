import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { SearchParams } from "nuqs/server";
import { normalizeFilters } from "@/lib/utils";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { loaderProductFilters } from "@/app/(client)/hooks/products/product-filters";
import { ProductSection } from "@/app/(client)/_components/product-section";

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

  await queryClient.prefetchInfiniteQuery(
    trpc.client.productsRouterClient.getAll.infiniteQueryOptions({
      ...normalizedFilters,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductSection
          title="Our Products"
          description="Discover our curated selection of products in this subcategory. Find the perfect items that match your style and needs."
          slugCategories={[slugCategory]}
          slugSubcategories={[slugSubcategory]}
        />
      </HydrationBoundary>
    </div>
  );
};

export default CategoriesPage;

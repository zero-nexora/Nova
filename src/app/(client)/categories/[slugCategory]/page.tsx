import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ProductSection } from "../../_components/product-section";
import { loaderProductFilters } from "../../hooks/products/product-filters";
import type { SearchParams } from "nuqs/server";
import { normalizeFilters } from "@/lib/utils";
import { DEFAULT_LIMIT } from "@/lib/constants";

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
          description="Browse through our wide range of categories and discover the products you love."
          slugCategories={[slugCategory]}
        />
      </HydrationBoundary>
    </div>
  );
};

export default CategoriesPage;

import { getQueryClient, trpc } from "@/trpc/server";
import { ProductDetail } from "./_components/product-detail";
import { ProductSection } from "../../_components/product-section";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { loaderProductFilters } from "../../hooks/products/product-filters";
import { normalizeFilters } from "@/lib/utils";
import { DEFAULT_LIMIT } from "@/lib/constants";
import type { SearchParams } from "nuqs/server";

interface ProductDetailPageProps {
  searchParams: Promise<SearchParams>;
  params: Promise<{ slug: string }>;
}

const ProductDetailPage = async ({
  params,
  searchParams,
}: ProductDetailPageProps) => {
  const { slug } = await params;
  const queryClient = getQueryClient();
  const filters = await loaderProductFilters(searchParams);
  const normalizedFilters = normalizeFilters({
    ...filters,
  });

  await Promise.all([
    queryClient.prefetchQuery(
      trpc.client.productsRouterClient.getBySlug.queryOptions({ slug })
    ),
    queryClient.prefetchInfiniteQuery(
      trpc.client.productsRouterClient.getAll.infiniteQueryOptions({
        ...normalizedFilters,
        limit: DEFAULT_LIMIT,
      })
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetail slug={slug} />
      <ProductSection
        excludeSlugs={[slug]}
        title="You may also like"
        description="Discover more products that might interest you."
      />
    </HydrationBoundary>
  );
};

export default ProductDetailPage;

import { getQueryClient, trpc } from "@/trpc/server";
import {
  ProductDetail,
  ProductDetailSkeleton,
} from "./_components/product-detail";
import {
  ProductSection,
  ProductSectionSkeleton,
} from "../../_components/product-section";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { loaderProductFilters } from "../../hooks/products/product-filters";
import { normalizeFilters } from "@/lib/utils";
import { DEFAULT_LIMIT } from "@/lib/constants";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

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

  void Promise.all([
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
    <main>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<ProductDetailPageSkeleton />}>
          <ProductDetail slug={slug} />
          <ProductSection
            excludeSlugs={[slug]}
            title="You may also like"
            description="Discover more products that might interest you."
          />
        </Suspense>
      </HydrationBoundary>
    </main>
  );
};

export default ProductDetailPage;

const ProductDetailPageSkeleton = () => (
  <>
    <ProductDetailSkeleton />
    <ProductSectionSkeleton />
  </>
);

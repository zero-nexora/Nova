// src/app/products/[slug]/page.tsx
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
import { Suspense } from "react";
import type { SearchParams } from "nuqs";
import { PageHeader } from "@/components/global/page-header";

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
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetail slug={slug} />
        </Suspense>
        <PageHeader
          title="Related Products"
          description="You may also like these products that complement your current selection."
        />
        <Suspense fallback={<ProductSectionSkeleton />}>
          <ProductSection excludeSlugs={[slug]} />
        </Suspense>
      </HydrationBoundary>
    </main>
  );
};

export default ProductDetailPage;

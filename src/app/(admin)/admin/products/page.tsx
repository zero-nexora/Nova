import { Metadata } from "next";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PageHeader } from "@/components/global/page-header";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { ProductView } from "./_components/product-view";
import type { SearchParams } from "nuqs/server";
import { loaderProductFilters } from "./hooks/products/product-filters";
import { cleanProductFilters } from "@/lib/utils";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/global/data-table-skeleton";

export const metadata: Metadata = {
  title: "Product Management | Admin Dashboard",
  description:
    "Add, edit, and organize products in your e-commerce inventory with ease.",
  keywords: [
    "products",
    "product management",
    "e-commerce",
    "admin",
    "inventory",
  ],
};

interface ProductPageProps {
  searchParams: Promise<SearchParams>;
}

const ProductPage = async ({ searchParams }: ProductPageProps) => {
  const queryClient = getQueryClient();
  const filters = await loaderProductFilters(searchParams);
  const normalizedFilters = cleanProductFilters(filters);

  void queryClient.prefetchQuery(
    trpc.admin.productsRouter.getAll.queryOptions({
      ...normalizedFilters,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <main className="space-y-8">
      <PageHeader title="Products" description="Manage your product catalog." />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<DataTableSkeleton />}>
          <ProductView />
        </Suspense>
      </HydrationBoundary>
    </main>
  );
};

export default ProductPage;

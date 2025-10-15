import { Metadata } from "next";
import { DEFAULT_LIMIT } from "@/lib/constants";
import type { SearchParams } from "nuqs/server";
import { cleanProductFilters } from "@/lib/utils";
import { getQueryClient, trpc } from "@/trpc/server";
import { ProductView } from "./_components/product-view";
import { PageHeader } from "@/components/global/page-header";
import { RoleGuardProvider } from "@/providers/role-guard-provider";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { loaderProductFilters } from "./hooks/products/product-filters";

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
    <main>
      <RoleGuardProvider check="adminOrManageProduct">
        <PageHeader
          title="Products"
          description="Manage your product catalog."
        />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ProductView />
        </HydrationBoundary>
      </RoleGuardProvider>
    </main>
  );
};

export default ProductPage;

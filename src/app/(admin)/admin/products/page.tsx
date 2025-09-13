import { Metadata } from "next";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PageHeader } from "@/components/global/page-header";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";
import { ProductView } from "./_components/product-view";

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
  openGraph: {
    title: "Product Management",
    description:
      "Easily manage and organize your products with our powerful admin tools.",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

const ProductPage = async () => {
  const queryClient = getQueryClient();

  // Prefetch data on server
  await Promise.all([
    queryClient.prefetchQuery(
      trpc.admin.productsRouter.getAll.queryOptions({
        page: DEFAULT_PAGE,
        limit: DEFAULT_LIMIT,
      })
    ),
  ]);

  return (
    <main>
      <div className="space-y-8">
        <PageHeader
          title="Products"
          description="Manage your product catalog."
        />

        <section aria-label="Product management">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductView />
          </HydrationBoundary>
        </section>
      </div>
    </main>
  );
};

export default ProductPage;
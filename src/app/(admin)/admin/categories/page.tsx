import { Metadata } from "next";
import { getQueryClient, trpc } from "@/trpc/server";
import { CategoryView } from "./_components/category-view";
import { PageHeader } from "@/components/global/page-header";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

export const metadata: Metadata = {
  title: "Category Management | Admin Dashboard",
  description:
    "Manage product categories, create new categories, and organize your e-commerce inventory efficiently.",
  keywords: [
    "categories",
    "product management",
    "e-commerce",
    "admin",
    "inventory",
  ],
  openGraph: {
    title: "Category Management",
    description:
      "Efficiently manage your product categories with our intuitive admin interface",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

const CategoriesPage = async () => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    trpc.admin.categoriesRouter.getAll.queryOptions()
  );

  return (
    <main>
      <div className="space-y-8">
        <PageHeader
          title="Categories"
          description="Manage and organize your product categories to improve customer navigation and inventory management"
        />

        <section aria-label="Categories list" className="space-y-4">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <CategoryView />
          </HydrationBoundary>
        </section>
      </div>
    </main>
  );
};

export default CategoriesPage;

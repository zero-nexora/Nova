import { getQueryClient, trpc } from "@/trpc/server";
import { CategoryView } from "./_components/category-view";
import { PageHeader } from "@/components/global/page-header";
import { CreateCategory } from "./_components/create-category";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { CategorySkeleton } from "@/components/global/category-skeleton";
import { Metadata } from "next";

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
    index: false, // Admin pages typically shouldn't be indexed
    follow: false,
  },
};

const CategoryPageSkeleton = () => (
  <div className="space-y-6 animate-in fade-in-50 duration-200">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="h-5 w-72 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-10 w-32 bg-muted rounded-md animate-pulse" />
    </div>
    <CategorySkeleton />
  </div>
);

const CategoriesPage = async () => {
  const queryClient = getQueryClient();

  // Prefetch data for better performance
  await queryClient.prefetchQuery(
    trpc.admin.categoriesRouter.getAll.queryOptions()
  );

  return (
    <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <PageHeader
          title="Categories"
          description="Manage and organize your product categories to improve customer navigation and inventory management"
        >
          <CreateCategory />
        </PageHeader>

        <section aria-label="Categories list" className="space-y-4">
          <HydrationBoundary state={dehydrate(queryClient)}>
            {/* <Suspense fallback={<CategoryPageSkeleton />}> */}
              <CategoryView />
            {/* </Suspense> */}
          </HydrationBoundary>
        </section>
      </div>
    </main>
  );
};

export default CategoriesPage;

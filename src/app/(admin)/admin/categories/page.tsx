import { getQueryClient, trpc } from "@/trpc/server";
import { CategoryView } from "./_components/category-view";
import { PageHeader } from "@/components/global/page-header";
import { CreateCategory } from "./_components/create-category";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { CategorySkeleton } from "@/components/global/category-skeleton";

const CategoriesPage = async () => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    trpc.admin.categoriesRouter.getAll.queryOptions()
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Categories"
        description="Manage your product categories"
      >
        <CreateCategory />
      </PageHeader>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<CategorySkeleton />}>
          <CategoryView />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
};

export default CategoriesPage;

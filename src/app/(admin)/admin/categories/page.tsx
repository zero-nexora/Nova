import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { CategoriesTable } from "./_components/categories-table";
import { PageHeader } from "@/components/global/page-header";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/global/data-table-skeleton";
import { CreateCategory } from "./_components/create-category";

const CategoriesPage = async () => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(trpc.categoriesAdmin.getMany.queryOptions());

  return (
    <div className="space-y-4">
      <PageHeader
        title="Categories"
        description="Manage your product categories"
      >
        <CreateCategory />
      </PageHeader>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={<DataTableSkeleton columnCount={7} rowCount={10} />}
        >
        </Suspense>
      </HydrationBoundary>
          <CategoriesTable />
    </div>
  );
};

export default CategoriesPage;

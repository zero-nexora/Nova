import { getQueryClient, trpc } from "@/trpc/server";
import { PageHeader } from "@/components/global/page-header";
import { CreateCategory } from "./_components/create-category";
import { CategoriesTable } from "./_components/categories-table";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

const CategoriesPage = async () => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(trpc.admin.categoriesRouter.getAll.queryOptions());

  return (
    <div className="space-y-4">
      <PageHeader
        title="Categories"
        description="Manage your product categories"
      >
        <CreateCategory />
      </PageHeader>

      <HydrationBoundary state={dehydrate(queryClient)}>
          <CategoriesTable />
      </HydrationBoundary>
    </div>
  );
};

export default CategoriesPage;

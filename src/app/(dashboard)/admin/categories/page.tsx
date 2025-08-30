import { getQueryClient, trpc } from "@/trpc/server"

const CategoriesPage = async () => {
 const queryClient = getQueryClient();
 await queryClient.prefetchQuery(trpc.categoriesAdmin.getMany.queryOptions());

  return (
    <div>
      <h1 className="text-3xl font-semibold text-muted-foreground">Categories</h1>
    </div>
  )
}

export default CategoriesPage
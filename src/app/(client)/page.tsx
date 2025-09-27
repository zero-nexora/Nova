import { getQueryClient, trpc } from "@/trpc/server";
import { CategorySection } from "./_components/category-section";
import { Header } from "./_components/header";
import { ProductSection } from "./_components/product-section";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

const Home = async () => {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchInfiniteQuery(
      trpc.client.productsRouterClient.getAll.infiniteQueryOptions({
        limit: DEFAULT_LIMIT,
      })
    ),
    queryClient.prefetchQuery(
      trpc.client.categoriesRouterClient.getAll.queryOptions()
    ),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Header />
        <CategorySection />
        <ProductSection />
      </HydrationBoundary>
    </div>
  );
};

export default Home;

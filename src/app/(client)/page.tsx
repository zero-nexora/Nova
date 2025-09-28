import { getQueryClient, trpc } from "@/trpc/server";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { HomeView } from "./_components/home-view";

const HomePage = async () => {
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
        <HomeView />
      </HydrationBoundary>
    </div>
  );
};

export default HomePage;

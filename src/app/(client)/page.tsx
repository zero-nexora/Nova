import { getQueryClient, trpc } from "@/trpc/server";
import { CategorySection } from "./_components/category-section";
import { Header } from "./_components/header";
import { ProductSection } from "./_components/product-section";
import { DEFAULT_LIMIT } from "@/lib/constants";

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
      <Header />
      <CategorySection />
      <ProductSection />
    </div>
  );
};

export default Home;

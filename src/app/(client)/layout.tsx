import { StoreClientProvider } from "@/providers/store-client-provider";
import { CategorySection } from "./_components/category-section";
import { Header } from "./_components/header";
import { getQueryClient, trpc } from "@/trpc/server";

interface LayoutHomeProps {
  children: React.ReactNode;
}

export default async function LayoutClient({ children }: LayoutHomeProps) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    trpc.client.categoriesRouterClient.getAll.queryOptions()
  );

  return (
    <StoreClientProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <CategorySection />
        <main className="flex-1 container mx-auto pt-8">{children}</main>
      </div>
    </StoreClientProvider>
  );
}

import { auth } from "@clerk/nextjs/server";
import { InfoBar } from "./_components/info-bar";
import { Sidebar } from "./_components/sidebar";
import { Unauthorized } from "@/components/global/unauthorized";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

interface LayoutAdminProps {
  children: React.ReactNode;
}

const LayoutAdmin = async ({ children }: LayoutAdminProps) => {
  const { userId } = await auth();
  const queryClient = getQueryClient();

  void Promise.all([
    queryClient.prefetchQuery(
      trpc.admin.categoriesRouter.getAll.queryOptions()
    ),
    queryClient.prefetchQuery(
      trpc.admin.productsRouter.getAllProductAttributes.queryOptions()
    ),
  ]);

  if (!userId) return <Unauthorized />;

  return (
    <main>
      <Sidebar />
      <div className="md:pl-[300px]">
        <InfoBar />
        <div className="relative p-4 pt-20 h-screen">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </HydrationBoundary>
        </div>
      </div>
    </main>
  );
};

export default LayoutAdmin;

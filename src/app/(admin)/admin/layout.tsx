import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { Sidebar } from "./_components/sidebar";
import { InfoBar } from "./_components/info-bar";
import { getQueryClient, trpc } from "@/trpc/server";
import { Unauthorized } from "@/components/global/unauthorized";
import { RoleGuardProvider } from "@/providers/role-guard-provider";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { LoadingPage } from "@/components/global/loading-page";

export const dynamic = "force-dynamic";

interface LayoutAdminProps {
  children: React.ReactNode;
}

const LayoutAdmin = async ({ children }: LayoutAdminProps) => {
  const { userId } = await auth();

  if (!userId) return <Unauthorized />;

  const queryClient = getQueryClient();

  void Promise.all([
    queryClient.prefetchQuery(
      trpc.admin.categoriesRouter.getAll.queryOptions()
    ),
    queryClient.prefetchQuery(
      trpc.admin.productsRouter.getAllProductAttributes.queryOptions()
    ),
    queryClient.prefetchQuery(
      trpc.admin.permissionsRouter.getAllRolePermissions.queryOptions()
    ),
  ]);

  return (
    <main>
      <RoleGuardProvider check="hasAnyRole">
        <Sidebar />
        <div className="md:pl-[300px]">
          <InfoBar />
          <div className="relative p-4 py-20 h-screen">
            <HydrationBoundary state={dehydrate(queryClient)}>
              <Suspense fallback={<LoadingPage />}>{children}</Suspense>
            </HydrationBoundary>
          </div>
        </div>
      </RoleGuardProvider>
    </main>
  );
};

export default LayoutAdmin;

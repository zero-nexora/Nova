import { Suspense } from "react";
import { RoleGuardProvider } from "@/providers/role-guard-provider";
import { getQueryClient, trpc } from "@/trpc/server";
import { PageHeader } from "@/components/global/page-header";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { PermissionsTable } from "./_components/permissions-table";

export const dynamic = "force-dynamic";

const RolesPage = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.admin.permissionsRouter.getAllPermissions.queryOptions()
  );

  return (
    <main className="flex flex-col gap-8">
      <RoleGuardProvider check="adminOrManageStaff">
        <PageHeader
          title="Permissions"
          description="Manage user permissions."
        />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<div>Loading...</div>}>
            <PermissionsTable />
          </Suspense>
        </HydrationBoundary>
      </RoleGuardProvider>
    </main>
  );
};

export default RolesPage;

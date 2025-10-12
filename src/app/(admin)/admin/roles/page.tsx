import { Suspense } from "react";
import { RoleGuardProvider } from "@/providers/role-guard-provider";
import { getQueryClient, trpc } from "@/trpc/server";
import { PageHeader } from "@/components/global/page-header";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  RolesAndPermissionsTable,
} from "./_components/roles-and-permissions-table";

export const dynamic = "force-dynamic";

const RolesPage = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.admin.rolesAndPermissionsRouter.getAllRoleAndPermissions.queryOptions()
  );

  return (
    <main className="flex flex-col gap-8">
      <RoleGuardProvider check="adminOrManageStaff">
        <PageHeader
          title="Roles and Permissions"
          description="Manage user roles and permissions."
        />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<div>Loading...</div>}>
            <RolesAndPermissionsTable />
          </Suspense>
        </HydrationBoundary>
      </RoleGuardProvider>
    </main>
  );
};

export default RolesPage;

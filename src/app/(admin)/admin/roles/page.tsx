import { Suspense } from "react";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  RolesAndPermissionsTable,
  TableSkeleton,
} from "./_components/roles-and-permissions-table";
import { PageHeader } from "@/components/global/page-header";

export const dynamic = "force-dynamic";

const RolesPage = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.admin.rolesAndPermissionsRouter.getAllRoleAndPermissions.queryOptions()
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Roles and Permissions"
        description="Manage user roles and permissions."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<TableSkeleton />}>
          <RolesAndPermissionsTable />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
};

export default RolesPage;

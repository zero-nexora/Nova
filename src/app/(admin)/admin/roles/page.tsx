import { PageHeader } from "@/components/global/page-header";
import { RoleGuardProvider } from "@/providers/role-guard-provider";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { loaderUserRoleFilters } from "./hooks/user-filters";
import type { SearchParams } from "nuqs";
import { cleanUserRoleFilters } from "@/lib/utils";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { UserRoleView } from "./_components/user-role-view";

interface ProductPageProps {
  searchParams: Promise<SearchParams>;
}

const RolesPage = async ({ searchParams }: ProductPageProps) => {
  const queryClient = getQueryClient();
  const filters = await loaderUserRoleFilters(searchParams);
  const normalizedFilters = cleanUserRoleFilters(filters);

  void queryClient.prefetchQuery(
    trpc.admin.rolesRouter.getUserByRole.queryOptions({
      ...normalizedFilters,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <main className="space-y-4">
      <RoleGuardProvider check="adminOrManageStaff">
        <PageHeader
          title="User Roles"
          description="Configure roles for user access."
        />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <UserRoleView />
        </HydrationBoundary>
      </RoleGuardProvider>
    </main>
  );
};

export default RolesPage;

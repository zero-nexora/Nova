import type { SearchParams } from "nuqs";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { cleanUserRoleFilters } from "@/lib/utils";
import { getQueryClient, trpc } from "@/trpc/server";
import { UserRoleView } from "./_components/user-role-view";
import { loaderUserRoleFilters } from "./hooks/user-filters";
import { PageHeader } from "@/components/global/page-header";
import { RoleGuardProvider } from "@/providers/role-guard-provider";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

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
      <RoleGuardProvider check="adminOrManageRole">
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

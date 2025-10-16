import { Suspense } from "react";
import { PageHeader } from "@/components/global/page-header";
import { RoleGuardProvider } from "@/providers/role-guard-provider";
import {
  PermissionsTable,
  PermissionsTableSkeleton,
} from "./_components/permissions-table";

const RolesPage = () => {
  return (
    <main className="flex flex-col gap-8">
      <RoleGuardProvider check="adminOrManageStaff">
        <PageHeader
          title="Permissions"
          description="Control user access and roles."
        />
        <Suspense fallback={<PermissionsTableSkeleton />}>
          <PermissionsTable />
        </Suspense>
      </RoleGuardProvider>
    </main>
  );
};

export default RolesPage;

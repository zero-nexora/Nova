import { PageHeader } from "@/components/global/page-header";
import { PermissionsTable } from "./_components/permissions-table";
import { RoleGuardProvider } from "@/providers/role-guard-provider";

const RolesPage = () => {
  return (
    <main className="flex flex-col gap-8">
      <RoleGuardProvider check="adminOrManageStaff">
        <PageHeader
          title="Permissions"
          description="Manage user permissions."
        />
        <PermissionsTable />
      </RoleGuardProvider>
    </main>
  );
};

export default RolesPage;

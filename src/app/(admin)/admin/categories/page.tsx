import { Metadata } from "next";
import { CategoryView } from "./_components/category-view";
import { PageHeader } from "@/components/global/page-header";
import { RoleGuardProvider } from "@/providers/role-guard-provider";

export const metadata: Metadata = {
  title: "Category Management | Admin Dashboard",
  description:
    "Manage product categories, create new categories, and organize your e-commerce inventory efficiently.",
  keywords: [
    "categories",
    "product management",
    "e-commerce",
    "admin",
    "inventory",
  ],
};

const CategoriesPage = async () => {
  return (
    <main>
      <RoleGuardProvider check="adminOrManageCategory">
        <div className="space-y-8">
          <PageHeader
            title="Categories"
            description="Manage and organize your product categories to improve customer navigation and inventory management"
          />
          <CategoryView />
        </div>
      </RoleGuardProvider>
    </main>
  );
};

export default CategoriesPage;

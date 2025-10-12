import { Metadata } from "next";
import { Suspense } from "react";
import { RoleGuardProvider } from "@/providers/role-guard-provider";
import { CategoryView } from "./_components/category-view";
import { PageHeader } from "@/components/global/page-header";
import { CategoryListSkeleton } from "@/components/global/category-skeleton";

export const dynamic = "force-dynamic";

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
          <Suspense fallback={<CategoryListSkeleton />}>
            <CategoryView />
          </Suspense>
        </div>
      </RoleGuardProvider>
    </main>
  );
};

export default CategoriesPage;

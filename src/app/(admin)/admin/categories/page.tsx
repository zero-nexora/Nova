import { Metadata } from "next";
import { CategoryView, CategoryViewSkeleton } from "./_components/category-view";
import { PageHeader } from "@/components/global/page-header";
import { RoleGuardProvider } from "@/providers/role-guard-provider";
import { Suspense } from "react";

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
            title="Category & Subcategory Management"
            description="Organize your product catalog by managing categories and subcategories, ensuring a seamless shopping experience for customers."
          />
          <Suspense fallback={<CategoryViewSkeleton />}>
            <CategoryView />
          </Suspense>
        </div>
      </RoleGuardProvider>
    </main>
  );
};

export default CategoriesPage;

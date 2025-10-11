import { Metadata } from "next";
import { CategoryView } from "./_components/category-view";
import { PageHeader } from "@/components/global/page-header";
import { Suspense } from "react";
import { CategoryListSkeleton } from "@/components/global/category-skeleton";

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
      <div className="space-y-8">
        <PageHeader
          title="Categories"
          description="Manage and organize your product categories to improve customer navigation and inventory management"
        />
        <Suspense fallback={<CategoryListSkeleton />}>
          <CategoryView />
        </Suspense>
      </div>
    </main>
  );
};

export default CategoriesPage;

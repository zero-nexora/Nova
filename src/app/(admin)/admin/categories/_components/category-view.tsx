"use client";

import { CategorySkeleton } from "@/components/global/category-skeleton";
import { CategoryList } from "./category-list";
import { CategoryStats } from "@/components/global/category-stats";
import { CreateCategory } from "./create-category";
import { CreateSubcategory } from "./create-subcategory";
import { useCategoriesStore } from "@/stores/admin/categories-store";

export const CategoryView = () => {
  const { categories, error, loading } = useCategoriesStore();

  if (loading) {
    return <CategorySkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-destructive">
            Failed to load categories
          </h3>
          <p className="text-muted-foreground">
            Please try refreshing the page or contact support if the problem
            persists.
          </p>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">No categories found</h3>
          <p className="text-muted-foreground">
            Get started by creating your first category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <CreateCategory />
        <CreateSubcategory />
      </div>
      {/* <CategoryStats categories={categories} /> */}
      <CategoryList categories={categories} />
    </div>
  );
};

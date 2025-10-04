"use client";

import { CategoryList } from "./category-list";
import { CreateCategory } from "./create-category";
import { CreateSubcategory } from "./create-subcategory";
import { useCategoriesStore } from "@/stores/admin/categories-store";
import { CategoryListSkeleton } from "@/components/global/category-skeleton";
import { NotFoundDisplay } from "@/components/global/not-found-display";
import { ErrorDisplay } from "@/components/global/error-display";

export const CategoryView = () => {
  const { categories, error, loading } = useCategoriesStore();

  if (loading) {
    return <CategoryListSkeleton />;
  }

  if (error) return <ErrorDisplay errorMessage={error} />

  if (!categories || categories.length === 0) return <NotFoundDisplay />

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <CreateCategory />
        <CreateSubcategory />
      </div>
      <CategoryList categories={categories} />
    </div>
  );
};

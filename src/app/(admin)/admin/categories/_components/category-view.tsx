"use client";

import { CategoryList } from "./category-list";
import { CreateCategory } from "./create-category";
import { CreateSubcategory } from "./create-subcategory";
import { useCategoriesStore } from "@/stores/admin/categories-store";
import { CategoryListSkeleton } from "@/components/global/category-skeleton";
import { NotFound } from "@/components/global/not-found";
import { Error } from "@/components/global/error";

export const CategoryView = () => {
  const { categories, error, loading } = useCategoriesStore();

  if (loading) {
    return <CategoryListSkeleton />;
  }

  if (error) <Error />;

  if (!categories || categories.length === 0) return <NotFound />;

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

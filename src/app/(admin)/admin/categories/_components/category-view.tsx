"use client";

import { CategoryList } from "./category-list";
import { CreateCategory } from "./create-category";
import { CreateSubcategory } from "./create-subcategory";
import { NotFound } from "@/components/global/not-found";
import { Error } from "@/components/global/error";
import { useGetAllCategories } from "../hooks/categories/use-get-all-categories";
import { Empty } from "@/components/global/empty";

export const CategoryView = () => {
  const { categories, error } = useGetAllCategories();

  if (error) <Error />;

  if (!categories) return <NotFound />;

  if (!categories.length) return <Empty />;

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

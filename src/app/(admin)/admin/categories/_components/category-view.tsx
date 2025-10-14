"use client";

import { Suspense } from "react";
import { CategoryList } from "./category-list";
import { CreateCategory } from "./create-category";
import { CreateSubcategory } from "./create-subcategory";

export const CategoryView = () => {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <CreateCategory />
        <CreateSubcategory />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <CategoryList />
      </Suspense>
    </div>
  );
};

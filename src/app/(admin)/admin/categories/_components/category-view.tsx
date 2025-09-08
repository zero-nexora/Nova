"use client";

import { CategorySkeleton } from "@/components/global/category-skeleton";
import { useGetAllCategories } from "../hooks/custom-hook-category";
import CategoryList from "./category-list";
import { useEffect, useState } from "react";
import { CategoryStats } from "@/components/global/category-stats";

export const CategoryView = () => {
  const { isFetching, categories, error } = useGetAllCategories();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null

  if (isFetching) {
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
    <>
      {/* <CategoryStats categories={categories} /> */}
      <CategoryList categories={categories} />
    </>
  );
};

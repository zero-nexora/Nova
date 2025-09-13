"use client";

import { useGetAllCategories } from "@/app/(admin)/admin/categories/hooks/custom-hook-category";
import { useGetAllProductAttributes } from "@/app/(admin)/admin/products/hooks/custom-hook-product";

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  useGetAllCategories();
  useGetAllProductAttributes();

  return <>{children}</>;
};

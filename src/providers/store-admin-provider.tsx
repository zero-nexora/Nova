"use client";

import { useGetAllCategories } from "@/app/(admin)/admin/categories/hooks/categories/use-get-all-categories"
import { useGetAllProductAttributes } from "@/app/(admin)/admin/products/hooks/products/use-get-all-product-attributes";

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreAdminProvider = ({ children }: StoreProviderProps) => {
  useGetAllCategories();
  useGetAllProductAttributes();

  return <>{children}</>;
};

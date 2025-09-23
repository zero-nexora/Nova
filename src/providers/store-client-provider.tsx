"use client";

import { useGetAllCategories } from "@/app/(client)/hooks/categories/use-get-all-categories";

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreClientProvider = ({ children }: StoreProviderProps) => {
  useGetAllCategories();

  return <>{children}</>;
};

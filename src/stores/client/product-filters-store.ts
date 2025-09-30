"use client";

import { create } from "zustand";
import { ProductFilters } from "@/app/(client)/hooks/products/use-product-fillter";

interface ProductFiltersStore {
  filters: ProductFilters;
  setFilters: (filters: Partial<ProductFilters>) => void;
  resetFilters: (defaults: ProductFilters) => void;
}

export const useProductFiltersStore = create<ProductFiltersStore>((set) => ({
  filters: {} as ProductFilters,
  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: (defaults) => set({ filters: defaults }),
}));

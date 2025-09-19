"use client";

import { useCallback, useState } from "react";
import { PaginationState, ProductFilters } from "../types";

export const useProductFilters = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    categoryId: "",
    subcategoryId: "",
    deletedFilter: "false",
    priceRange: { min: "", max: "" },
  });

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
  });

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      categoryId: "",
      subcategoryId: "",
      deletedFilter: "false",
      priceRange: { min: "", max: "" },
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  return {
    filters,
    pagination,
    updateFilters,
    clearFilters,
    setPage,
    setLimit,
  };
};

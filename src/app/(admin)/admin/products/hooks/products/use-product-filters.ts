"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PaginationState, ProductFilters } from "../types";

export const useProductFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize filters and pagination from URL if available
  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get("search") || "",
    categoryId: searchParams.get("categoryId") || "all", // Chuyển "" thành "all"
    subcategoryId: searchParams.get("subcategoryId") || "all", // Chuyển "" thành "all"
    deletedFilter:
      (searchParams.get("deletedFilter") as "true" | "false" | "all") ||
      "false",
    priceRange: {
      min: searchParams.get("priceMin") || "",
      max: searchParams.get("priceMax") || "",
    },
  });

  const [pagination, setPagination] = useState<PaginationState>({
    page: Number(searchParams.get("page")) || 1,
  });

  const createQueryString = useCallback(
    (newFilters: ProductFilters, newPagination: PaginationState) => {
      const params = new URLSearchParams();
      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.categoryId && newFilters.categoryId !== "all") {
        params.set("categoryId", newFilters.categoryId);
      }
      if (newFilters.subcategoryId && newFilters.subcategoryId !== "all") {
        params.set("subcategoryId", newFilters.subcategoryId);
      }
      if (newFilters.deletedFilter)
        params.set("deletedFilter", newFilters.deletedFilter);
      if (newFilters.priceRange.min)
        params.set("priceMin", newFilters.priceRange.min);
      if (newFilters.priceRange.max)
        params.set("priceMax", newFilters.priceRange.max);
      if (newPagination.page !== 1)
        params.set("page", newPagination.page.toString());
      return params.toString();
    },
    []
  );

  useEffect(() => {
    const queryString = createQueryString(filters, pagination);
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
  }, [filters, pagination, pathname, router, createQueryString]);

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      subcategoryId: newFilters.categoryId
        ? newFilters.categoryId === "all" || newFilters.categoryId === ""
          ? "all"
          : prev.subcategoryId
        : prev.subcategoryId,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      categoryId: "all",
      subcategoryId: "all",
      deletedFilter: "false",
      priceRange: { min: "", max: "" },
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  return {
    filters,
    pagination,
    updateFilters,
    clearFilters,
    setPage,
  };
};

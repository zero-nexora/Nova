"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@/queries/admin/categories/types";

export const useCategorySelection = (categories: Category[]) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("searchCategory") ?? ""
  );
  const [filterDeleted, setFilterDeleted] = useState<
    "all" | "active" | "deleted"
  >(
    (searchParams.get("filterCategory") as "all" | "active" | "deleted") ??
      "all"
  );
  const [sortBy, setSortBy] = useState<"name" | "created_at" | "updated_at">(
    (searchParams.get("sortByCategory") as
      | "name"
      | "created_at"
      | "updated_at") ?? "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrderCategory") as "asc" | "desc") ?? "asc"
  );

  useEffect(() => {
    setSearchTerm(searchParams.get("searchCategory") ?? "");
    setFilterDeleted(
      (searchParams.get("filterCategory") as "all" | "active" | "deleted") ??
        "all"
    );
    setSortBy(
      (searchParams.get("sortByCategory") as
        | "name"
        | "created_at"
        | "updated_at") ?? "name"
    );
    setSortOrder(
      (searchParams.get("sortOrderCategory") as "asc" | "desc") ?? "asc"
    );
  }, [searchParams]);

  const updateURLParams = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value === "" || value === "all") newParams.delete(key);
        else newParams.set(key, value);
      });
      router.replace(`?${newParams.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const filteredCategories = useMemo(() => {
    const filtered = categories.filter((category) => {
      const matchesSearch = category.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterDeleted === "all" ||
        (filterDeleted === "active" && !category.is_deleted) ||
        (filterDeleted === "deleted" && category.is_deleted);
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "updated_at":
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [categories, searchTerm, filterDeleted, sortBy, sortOrder]);

  const selectedCategoriesData = useMemo(
    () => categories.filter((cat) => selectedCategories.has(cat.id)),
    [categories, selectedCategories]
  );

  const isAllCategoriesSelected = useMemo(
    () =>
      filteredCategories.length > 0 &&
      filteredCategories.every((c) => selectedCategories.has(c.id)),
    [filteredCategories, selectedCategories]
  );

  const isCategoriesIndeterminate = useMemo(() => {
    const selectedCount = filteredCategories.filter((c) =>
      selectedCategories.has(c.id)
    ).length;
    return selectedCount > 0 && selectedCount < filteredCategories.length;
  }, [filteredCategories, selectedCategories]);

  const handleSelectAllCategories = useCallback(
    (checked: boolean) => {
      setSelectedCategories(
        checked ? new Set(filteredCategories.map((c) => c.id)) : new Set()
      );
    },
    [filteredCategories]
  );

  const handleSelectCategory = useCallback((id: string, checked: boolean) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  return {
    selectedCategories,
    selectedCategoriesData,
    filteredCategories,
    isAllCategoriesSelected,
    isCategoriesIndeterminate,
    selectedCategoriesCount: selectedCategories.size,
    hasCategorySelection: selectedCategories.size > 0,
    searchTerm,
    filterDeleted,
    sortBy,
    sortOrder,
    handleSelectAllCategories,
    handleSelectCategory,
    clearCategorySelection: () => setSelectedCategories(new Set()),
    handleSearch: (term: string) => {
      setSearchTerm(term);
      updateURLParams({ searchCategory: term });
    },
    handleFilterChange: (filter: "all" | "active" | "deleted") => {
      setFilterDeleted(filter);
      updateURLParams({ filterCategory: filter });
    },
    handleSortChange: (sort: "name" | "created_at" | "updated_at") => {
      setSortBy(sort);
      updateURLParams({ sortByCategory: sort });
    },
    handleSortOrderChange: (order: "asc" | "desc") => {
      setSortOrder(order);
      updateURLParams({ sortOrderCategory: order });
    },
  };
};

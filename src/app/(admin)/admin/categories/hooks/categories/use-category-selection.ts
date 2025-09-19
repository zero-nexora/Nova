"use client";

import { useCallback, useMemo, useState } from "react";
import type { Category } from "@/stores/admin/categories-store";

export const useCategorySelection = (categories: Category[]) => {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDeleted, setFilterDeleted] = useState<
    "all" | "active" | "deleted"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "created_at" | "updated_at">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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
      let aValue, bValue;

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

  const selectedCategoriesData = useMemo(() => {
    return categories.filter((category) => selectedCategories.has(category.id));
  }, [categories, selectedCategories]);

  const isAllCategoriesSelected = useMemo(() => {
    return (
      filteredCategories.length > 0 &&
      filteredCategories.every((cat) => selectedCategories.has(cat.id))
    );
  }, [filteredCategories, selectedCategories]);

  const isCategoriesIndeterminate = useMemo(() => {
    const selectedCount = filteredCategories.filter((cat) =>
      selectedCategories.has(cat.id)
    ).length;
    return selectedCount > 0 && selectedCount < filteredCategories.length;
  }, [filteredCategories, selectedCategories]);

  const handleSelectAllCategories = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedCategories(new Set(filteredCategories.map((cat) => cat.id)));
      } else {
        setSelectedCategories(new Set());
      }
    },
    [filteredCategories]
  );

  const handleSelectCategory = useCallback(
    (categoryId: string, checked: boolean) => {
      setSelectedCategories((prev) => {
        const newSet = new Set(prev);
        if (checked) {
          newSet.add(categoryId);
        } else {
          newSet.delete(categoryId);
        }
        return newSet;
      });
    },
    []
  );

  const clearCategorySelection = useCallback(() => {
    setSelectedCategories(new Set());
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleFilterChange = useCallback(
    (filter: "all" | "active" | "deleted") => {
      setFilterDeleted(filter);
    },
    []
  );

  const handleSortChange = useCallback(
    (sort: "name" | "created_at" | "updated_at") => {
      setSortBy(sort);
    },
    []
  );

  const handleSortOrderChange = useCallback((order: "asc" | "desc") => {
    setSortOrder(order);
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
    clearCategorySelection,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handleSortOrderChange,
  };
};

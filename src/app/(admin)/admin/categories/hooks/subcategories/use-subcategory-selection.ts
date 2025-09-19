"use client";

import { Subcategory } from "@/stores/admin/categories-store";
import { useCallback, useMemo, useState } from "react";

export const useSubcategorySelection = (subcategories: Subcategory[]) => {
  const [selectedSubcategories, setSelectedSubcategories] = useState<
    Set<string>
  >(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDeleted, setFilterDeleted] = useState<
    "all" | "active" | "deleted"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "created_at" | "updated_at">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter + Search + Sort
  const filteredSubcategories = useMemo(() => {
    const filtered = subcategories.filter((subcategory) => {
      const matchesSearch = subcategory.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterDeleted === "all" ||
        (filterDeleted === "active" && !subcategory.is_deleted) ||
        (filterDeleted === "deleted" && subcategory.is_deleted);

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
  }, [subcategories, searchTerm, filterDeleted, sortBy, sortOrder]);

  // Selected subcategories data
  const selectedSubcategoriesData = useMemo(() => {
    return subcategories.filter((sub) => selectedSubcategories.has(sub.id));
  }, [subcategories, selectedSubcategories]);

  const isAllSubcategoriesSelected = useMemo(() => {
    return (
      filteredSubcategories.length > 0 &&
      filteredSubcategories.every((sub) => selectedSubcategories.has(sub.id))
    );
  }, [filteredSubcategories, selectedSubcategories]);

  const isSubcategoriesIndeterminate = useMemo(() => {
    const selectedCount = filteredSubcategories.filter((sub) =>
      selectedSubcategories.has(sub.id)
    ).length;
    return selectedCount > 0 && selectedCount < filteredSubcategories.length;
  }, [filteredSubcategories, selectedSubcategories]);

  // Selection handlers
  const handleSelectAllSubcategories = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedSubcategories(
          new Set(filteredSubcategories.map((sub) => sub.id))
        );
      } else {
        setSelectedSubcategories(new Set());
      }
    },
    [filteredSubcategories]
  );

  const handleSelectSubcategory = useCallback(
    (subcategoryId: string, checked: boolean) => {
      setSelectedSubcategories((prev) => {
        const newSet = new Set(prev);
        if (checked) {
          newSet.add(subcategoryId);
        } else {
          newSet.delete(subcategoryId);
        }
        return newSet;
      });
    },
    []
  );

  const clearSubcategorySelection = useCallback(() => {
    setSelectedSubcategories(new Set());
  }, []);

  // Search and filter handlers
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
    // State
    selectedSubcategories,
    selectedSubcategoriesData,
    filteredSubcategories,

    // Selection state
    isAllSubcategoriesSelected,
    isSubcategoriesIndeterminate,
    selectedSubcategoriesCount: selectedSubcategories.size,
    hasSubcategorySelection: selectedSubcategories.size > 0,

    // Search & filter state
    searchTerm,
    filterDeleted,
    sortBy,
    sortOrder,

    // Handlers
    handleSelectAllSubcategories,
    handleSelectSubcategory,
    clearSubcategorySelection,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handleSortOrderChange,
  };
};

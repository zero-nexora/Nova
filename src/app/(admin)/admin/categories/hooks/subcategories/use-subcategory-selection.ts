"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Subcategory } from "@/stores/admin/categories-store";

export const useSubcategorySelection = (subcategories: Subcategory[]) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedSubcategories, setSelectedSubcategories] = useState<
    Set<string>
  >(new Set());
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("searchSubcategory") ?? ""
  );
  const [filterDeleted, setFilterDeleted] = useState<
    "all" | "active" | "deleted"
  >(
    (searchParams.get("filterSubcategory") as "all" | "active" | "deleted") ??
      "all"
  );
  const [sortBy, setSortBy] = useState<"name" | "created_at" | "updated_at">(
    (searchParams.get("sortBySubcategory") as
      | "name"
      | "created_at"
      | "updated_at") ?? "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrderSubcategory") as "asc" | "desc") ?? "asc"
  );

  useEffect(() => {
    setSearchTerm(searchParams.get("searchSubcategory") ?? "");
    setFilterDeleted(
      (searchParams.get("filterSubcategory") as "all" | "active" | "deleted") ??
        "all"
    );
    setSortBy(
      (searchParams.get("sortBySubcategory") as
        | "name"
        | "created_at"
        | "updated_at") ?? "name"
    );
    setSortOrder(
      (searchParams.get("sortOrderSubcategory") as "asc" | "desc") ?? "asc"
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

  const filteredSubcategories = useMemo(() => {
    const filtered = subcategories.filter((sub) => {
      const matchesSearch = sub.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterDeleted === "all" ||
        (filterDeleted === "active" && !sub.is_deleted) ||
        (filterDeleted === "deleted" && sub.is_deleted);
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

  const selectedSubcategoriesData = useMemo(
    () => subcategories.filter((s) => selectedSubcategories.has(s.id)),
    [subcategories, selectedSubcategories]
  );

  const isAllSubcategoriesSelected = useMemo(
    () =>
      filteredSubcategories.length > 0 &&
      filteredSubcategories.every((s) => selectedSubcategories.has(s.id)),
    [filteredSubcategories, selectedSubcategories]
  );

  const isSubcategoriesIndeterminate = useMemo(() => {
    const selectedCount = filteredSubcategories.filter((s) =>
      selectedSubcategories.has(s.id)
    ).length;
    return selectedCount > 0 && selectedCount < filteredSubcategories.length;
  }, [filteredSubcategories, selectedSubcategories]);

  const handleSelectAllSubcategories = useCallback(
    (checked: boolean) => {
      setSelectedSubcategories(
        checked ? new Set(filteredSubcategories.map((s) => s.id)) : new Set()
      );
    },
    [filteredSubcategories]
  );

  const handleSelectSubcategory = useCallback(
    (id: string, checked: boolean) => {
      setSelectedSubcategories((prev) => {
        const newSet = new Set(prev);
        if (checked) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });
    },
    []
  );

  return {
    selectedSubcategories,
    selectedSubcategoriesData,
    filteredSubcategories,
    isAllSubcategoriesSelected,
    isSubcategoriesIndeterminate,
    selectedSubcategoriesCount: selectedSubcategories.size,
    hasSubcategorySelection: selectedSubcategories.size > 0,
    searchTerm,
    filterDeleted,
    sortBy,
    sortOrder,
    handleSelectAllSubcategories,
    handleSelectSubcategory,
    clearSubcategorySelection: () => setSelectedSubcategories(new Set()),
    handleSearch: (term: string) => {
      setSearchTerm(term);
      updateURLParams({ searchSubcategory: term });
    },
    handleFilterChange: (filter: "all" | "active" | "deleted") => {
      setFilterDeleted(filter);
      updateURLParams({ filterSubcategory: filter });
    },
    handleSortChange: (sort: "name" | "created_at" | "updated_at") => {
      setSortBy(sort);
      updateURLParams({ sortBySubcategory: sort });
    },
    handleSortOrderChange: (order: "asc" | "desc") => {
      setSortOrder(order);
      updateURLParams({ sortOrderSubcategory: order });
    },
  };
};

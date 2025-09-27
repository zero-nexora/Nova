export interface ProductFilters {
  limit?: number;
  sortBy?: "created_at" | "name" | "price";
  sortOrder?: "asc" | "desc";
  categoryId?: string;
  subcategoryId?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const useProductFilters = (filters: ProductFilters) => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined)
  );

  return cleanFilters;
};

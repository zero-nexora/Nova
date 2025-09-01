export interface Category {
  id: string;
  name: string;
  slug: string;
  parentName: string | null;
  parentId: string | null;
  image_url: string | null;
  public_id: string | null;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  deleted_at: Date | null;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

import { create } from "zustand";

interface CategoriesState {
  categories: Category[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;

  setCategories: (data: Category[], pagination: Pagination) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  pagination: null,
  loading: false,
  error: null,

  setCategories: (data, pagination) =>
    set({ categories: data, pagination, loading: false, error: null }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),

  reset: () =>
    set({
      categories: [],
      pagination: null,
      loading: false,
      error: null,
    }),
}));

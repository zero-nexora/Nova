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

import { create } from "zustand";

interface CategoriesState {
  categories: Category[];
  loading: boolean;

  setCategories: (data: Category[]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  pagination: null,
  loading: false,

  setCategories: (data) => set({ categories: data, loading: false }),

  setLoading: (loading) => set({ loading }),

  reset: () =>
    set({
      categories: [],
      loading: false,
    }),
}));

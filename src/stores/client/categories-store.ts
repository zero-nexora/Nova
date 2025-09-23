import { create } from "zustand";

export interface Subcategory {
  name: string;
  id: string;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
  slug: string;
  category_id: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
  subcategories: Subcategory[];
}

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: any;

  setCategories: (data: Category[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: any) => void;
  reset: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  loading: false,
  error: "",

  setCategories: (data: Category[]) => set({ categories: data }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: any) => set({ error }),

  reset: () =>
    set({
      categories: [],
      loading: false,
      error: null,
    }),
}));

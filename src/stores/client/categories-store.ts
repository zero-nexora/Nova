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
  setCategories: (data: Category[]) => void;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  setCategories: (data: Category[]) => set({ categories: data }),
}));

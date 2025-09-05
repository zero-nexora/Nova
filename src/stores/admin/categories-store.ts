export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  public_id: string | null;
  is_deleted: boolean;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;

  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;

  children?: Category[];
}

import { create } from "zustand";

interface CategoriesState {
  activeCategories: Category[];
  deletedCategories: Category[];
  loading: boolean;

  setActiveCategories: (data: Category[]) => void;
  setDeletedCategories: (data: Category[]) => void;
  setCategories: (active: Category[], deleted: Category[]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  activeCategories: [],
  deletedCategories: [],
  loading: false,

  setActiveCategories: (data) => set({ activeCategories: data }),
  setDeletedCategories: (data) => set({ deletedCategories: data }),
  setCategories: (active, deleted) =>
    set({ activeCategories: active, deletedCategories: deleted }),
  setLoading: (loading) => set({ loading }),

  reset: () =>
    set({
      activeCategories: [],
      deletedCategories: [],
      loading: false,
    }),
}));
